const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Lấy danh sách phòng chat của user
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [rooms] = await db.query(`
      SELECT 
        pc.id,
        pc.ma_phong,
        pc.ten_phong,
        pc.trang_thai,
        pc.hoat_dong_id,
        hd.ten_hoat_dong,
        hd.thoi_gian_bat_dau,
        clb.ten_clb,
        tvpc.vai_tro,
        (SELECT COUNT(*) FROM thanh_vien_phong_chat WHERE phong_chat_id = pc.id) as so_thanh_vien,
        (SELECT tn.noi_dung FROM tin_nhan tn WHERE tn.phong_chat_id = pc.id ORDER BY tn.created_at DESC LIMIT 1) as tin_nhan_cuoi,
        (SELECT tn.created_at FROM tin_nhan tn WHERE tn.phong_chat_id = pc.id ORDER BY tn.created_at DESC LIMIT 1) as thoi_gian_tin_nhan_cuoi
      FROM phong_chat pc
      JOIN thanh_vien_phong_chat tvpc ON pc.id = tvpc.phong_chat_id
      JOIN hoat_dong hd ON pc.hoat_dong_id = hd.id
      JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
      WHERE tvpc.nguoi_dung_id = ? AND pc.trang_thai = 'hoat_dong' AND tvpc.vai_tro != 'kicked'
      ORDER BY thoi_gian_tin_nhan_cuoi DESC, pc.created_at DESC
    `, [userId]);

    res.json(rooms);
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ message: 'Lỗi lấy danh sách phòng chat', error: error.message });
  }
});

// Lấy chi tiết phòng chat và tin nhắn
router.get('/room/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Kiểm tra user có trong phòng chat không (và không bị kick)
    const [membership] = await db.query(
      'SELECT * FROM thanh_vien_phong_chat WHERE phong_chat_id = ? AND nguoi_dung_id = ? AND vai_tro != "kicked"',
      [roomId, userId]
    );

    if (membership.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập phòng chat này' });
    }

    // Lấy thông tin phòng chat
    const [rooms] = await db.query(`
      SELECT 
        pc.*,
        hd.ten_hoat_dong,
        hd.thoi_gian_bat_dau,
        hd.dia_diem,
        clb.ten_clb
      FROM phong_chat pc
      JOIN hoat_dong hd ON pc.hoat_dong_id = hd.id
      JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
      WHERE pc.id = ?
    `, [roomId]);

    if (rooms.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chat' });
    }

    // Lấy danh sách thành viên (không bao gồm người bị kick)
    const [members] = await db.query(`
      SELECT 
        tvpc.*,
        nd.email,
        nd.loai_nguoi_dung,
        COALESCE(sv.ho_ten, 'Admin/Chủ nhiệm') as ho_ten,
        sv.anh_dai_dien
      FROM thanh_vien_phong_chat tvpc
      JOIN nguoi_dung nd ON tvpc.nguoi_dung_id = nd.id
      LEFT JOIN sinh_vien sv ON nd.id = sv.nguoi_dung_id
      WHERE tvpc.phong_chat_id = ? AND tvpc.vai_tro != 'kicked'
    `, [roomId]);

    // Lấy tin nhắn (50 tin nhắn gần nhất)
    const [messages] = await db.query(`
      SELECT 
        tn.*,
        nd.email,
        nd.loai_nguoi_dung,
        COALESCE(sv.ho_ten, 'Admin/Chủ nhiệm') as ho_ten,
        sv.anh_dai_dien
      FROM tin_nhan tn
      JOIN nguoi_dung nd ON tn.nguoi_gui_id = nd.id
      LEFT JOIN sinh_vien sv ON nd.id = sv.nguoi_dung_id
      WHERE tn.phong_chat_id = ?
      ORDER BY tn.created_at ASC
      LIMIT 100
    `, [roomId]);

    res.json({
      room: rooms[0],
      members,
      messages
    });
  } catch (error) {
    console.error('Get room detail error:', error);
    res.status(500).json({ message: 'Lỗi lấy chi tiết phòng chat', error: error.message });
  }
});

// Gửi tin nhắn text
router.post('/room/:roomId/message', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { noi_dung, loai_tin_nhan = 'text' } = req.body;
    const userId = req.user.id;

    // Kiểm tra user có trong phòng chat không
    const [membership] = await db.query(
      'SELECT * FROM thanh_vien_phong_chat WHERE phong_chat_id = ? AND nguoi_dung_id = ?',
      [roomId, userId]
    );

    if (membership.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền gửi tin nhắn trong phòng này' });
    }

    // Kiểm tra phòng chat còn hoạt động không
    const [room] = await db.query('SELECT * FROM phong_chat WHERE id = ? AND trang_thai = "hoat_dong"', [roomId]);
    if (room.length === 0) {
      return res.status(400).json({ message: 'Phòng chat đã đóng' });
    }

    // Lưu tin nhắn
    const [result] = await db.query(
      'INSERT INTO tin_nhan (phong_chat_id, nguoi_gui_id, loai_tin_nhan, noi_dung) VALUES (?, ?, ?, ?)',
      [roomId, userId, loai_tin_nhan, noi_dung]
    );

    // Lấy thông tin tin nhắn vừa gửi
    const [newMessage] = await db.query(`
      SELECT 
        tn.*,
        nd.email,
        nd.loai_nguoi_dung,
        COALESCE(sv.ho_ten, 'Admin/Chủ nhiệm') as ho_ten,
        sv.anh_dai_dien
      FROM tin_nhan tn
      JOIN nguoi_dung nd ON tn.nguoi_gui_id = nd.id
      LEFT JOIN sinh_vien sv ON nd.id = sv.nguoi_dung_id
      WHERE tn.id = ?
    `, [result.insertId]);

    // Emit socket event cho tất cả thành viên trong phòng
    const io = req.app.get('io');
    io.to(`room_${roomId}`).emit('new_message', newMessage[0]);

    res.json(newMessage[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Lỗi gửi tin nhắn', error: error.message });
  }
});

// Gửi tin nhắn hình ảnh
router.post('/room/:roomId/image', authenticateToken, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'Lỗi upload: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    console.log('Upload request - roomId:', roomId, 'userId:', userId);
    console.log('File:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn hình ảnh' });
    }

    // Kiểm tra user có trong phòng chat không
    const [membership] = await db.query(
      'SELECT * FROM thanh_vien_phong_chat WHERE phong_chat_id = ? AND nguoi_dung_id = ?',
      [roomId, userId]
    );

    if (membership.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền gửi tin nhắn trong phòng này' });
    }

    const imagePath = `/public/images/${req.file.filename}`;
    console.log('Image path:', imagePath);

    // Lưu tin nhắn hình ảnh
    const [result] = await db.query(
      'INSERT INTO tin_nhan (phong_chat_id, nguoi_gui_id, loai_tin_nhan, hinh_anh) VALUES (?, ?, "image", ?)',
      [roomId, userId, imagePath]
    );

    // Lấy thông tin tin nhắn vừa gửi
    const [newMessage] = await db.query(`
      SELECT 
        tn.*,
        nd.email,
        nd.loai_nguoi_dung,
        COALESCE(sv.ho_ten, 'Admin/Chủ nhiệm') as ho_ten,
        sv.anh_dai_dien
      FROM tin_nhan tn
      JOIN nguoi_dung nd ON tn.nguoi_gui_id = nd.id
      LEFT JOIN sinh_vien sv ON nd.id = sv.nguoi_dung_id
      WHERE tn.id = ?
    `, [result.insertId]);

    // Emit socket event
    const io = req.app.get('io');
    io.to(`room_${roomId}`).emit('new_message', newMessage[0]);

    res.json(newMessage[0]);
  } catch (error) {
    console.error('Send image error:', error);
    res.status(500).json({ message: 'Lỗi gửi hình ảnh', error: error.message });
  }
});

// Xóa phòng chat (chỉ chủ nhiệm CLB hoặc admin)
router.delete('/room/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.loai_nguoi_dung;

    // Kiểm tra quyền xóa
    const [membership] = await db.query(
      'SELECT * FROM thanh_vien_phong_chat WHERE phong_chat_id = ? AND nguoi_dung_id = ? AND vai_tro IN ("admin", "chu_nhiem")',
      [roomId, userId]
    );

    if (membership.length === 0 && userRole !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa phòng chat này' });
    }

    // Đóng phòng chat (soft delete)
    await db.query('UPDATE phong_chat SET trang_thai = "dong" WHERE id = ?', [roomId]);

    // Emit socket event
    const io = req.app.get('io');
    io.to(`room_${roomId}`).emit('room_closed', { roomId });

    res.json({ message: 'Đã đóng phòng chat' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Lỗi xóa phòng chat', error: error.message });
  }
});

// Đồng bộ phòng chat - tạo phòng chat cho hoạt động cũ và thêm thành viên
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let syncedRooms = 0;
    let syncedMembers = 0;

    // 1. Tạo phòng chat cho các hoạt động chưa có phòng chat
    const [activitiesWithoutRoom] = await db.query(`
      SELECT hd.id, hd.ten_hoat_dong, hd.cau_lac_bo_id, clb.chu_nhiem_id
      FROM hoat_dong hd
      JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
      LEFT JOIN phong_chat pc ON hd.id = pc.hoat_dong_id
      WHERE pc.id IS NULL AND hd.trang_thai IN ('sap_dien_ra', 'dang_dien_ra')
    `);

    for (const activity of activitiesWithoutRoom) {
      // Tạo phòng chat
      const [roomResult] = await db.query(
        'INSERT INTO phong_chat (hoat_dong_id, ma_phong, ten_phong) VALUES (?, ?, ?)',
        [activity.id, `HD-${activity.id}`, activity.ten_hoat_dong]
      );
      
      // Thêm chủ nhiệm vào phòng
      if (activity.chu_nhiem_id) {
        await db.query(
          'INSERT IGNORE INTO thanh_vien_phong_chat (phong_chat_id, nguoi_dung_id, vai_tro) VALUES (?, ?, "chu_nhiem")',
          [roomResult.insertId, activity.chu_nhiem_id]
        );
      }
      syncedRooms++;
    }

    // 2. Thêm sinh viên đã được duyệt vào phòng chat (không thêm lại người đã bị kick)
    const [approvedRegistrations] = await db.query(`
      SELECT 
        dk.sinh_vien_id,
        dk.hoat_dong_id,
        sv.nguoi_dung_id,
        pc.id as phong_chat_id
      FROM dang_ky_hoat_dong dk
      JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
      JOIN phong_chat pc ON dk.hoat_dong_id = pc.hoat_dong_id
      LEFT JOIN thanh_vien_phong_chat tvpc ON pc.id = tvpc.phong_chat_id AND sv.nguoi_dung_id = tvpc.nguoi_dung_id
      WHERE dk.trang_thai = 'da_duyet' 
        AND (tvpc.id IS NULL OR tvpc.vai_tro = 'kicked')
        AND NOT EXISTS (
          SELECT 1 FROM thanh_vien_phong_chat t2 
          WHERE t2.phong_chat_id = pc.id 
          AND t2.nguoi_dung_id = sv.nguoi_dung_id 
          AND t2.vai_tro = 'kicked'
        )
    `);

    for (const reg of approvedRegistrations) {
      await db.query(
        'INSERT IGNORE INTO thanh_vien_phong_chat (phong_chat_id, nguoi_dung_id, vai_tro) VALUES (?, ?, "sinh_vien")',
        [reg.phong_chat_id, reg.nguoi_dung_id]
      );
      syncedMembers++;
    }

    res.json({ 
      message: 'Đồng bộ thành công',
      syncedRooms,
      syncedMembers
    });
  } catch (error) {
    console.error('Sync chat error:', error);
    res.status(500).json({ message: 'Lỗi đồng bộ phòng chat', error: error.message });
  }
});

// Kick thành viên khỏi phòng chat (chỉ admin/chủ nhiệm)
router.delete('/room/:roomId/member/:memberId', authenticateToken, async (req, res) => {
  try {
    const { roomId, memberId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.loai_nguoi_dung;

    // Kiểm tra quyền kick (phải là admin hoặc chủ nhiệm)
    const [membership] = await db.query(
      'SELECT * FROM thanh_vien_phong_chat WHERE phong_chat_id = ? AND nguoi_dung_id = ? AND vai_tro IN ("admin", "chu_nhiem")',
      [roomId, userId]
    );

    if (membership.length === 0 && userRole !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền kick thành viên' });
    }

    // Không cho phép kick admin hoặc chủ nhiệm
    const [targetMember] = await db.query(
      'SELECT * FROM thanh_vien_phong_chat WHERE phong_chat_id = ? AND nguoi_dung_id = ?',
      [roomId, memberId]
    );

    if (targetMember.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thành viên' });
    }

    if (targetMember[0].vai_tro === 'admin' || targetMember[0].vai_tro === 'chu_nhiem') {
      return res.status(400).json({ message: 'Không thể kick admin hoặc chủ nhiệm' });
    }

    // Lấy thông tin phòng chat và CLB
    const [roomInfo] = await db.query(`
      SELECT pc.*, hd.ten_hoat_dong, clb.ten_clb 
      FROM phong_chat pc
      JOIN hoat_dong hd ON pc.hoat_dong_id = hd.id
      JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
      WHERE pc.id = ?
    `, [roomId]);

    // Đánh dấu thành viên bị kick (thay vì xóa, cập nhật vai_tro thành 'kicked')
    await db.query(
      'UPDATE thanh_vien_phong_chat SET vai_tro = "kicked" WHERE phong_chat_id = ? AND nguoi_dung_id = ?',
      [roomId, memberId]
    );

    // Tạo thông báo cho sinh viên bị kick
    const tenPhong = roomInfo[0]?.ten_phong || 'phòng chat';
    const tenCLB = roomInfo[0]?.ten_clb || 'CLB';
    await db.query(
      'INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung) VALUES (?, ?, ?, ?)',
      [
        memberId, 
        'nho_hoat_dong',
        'Bạn đã bị mời ra khỏi phòng chat',
        `Chủ nhiệm ${tenCLB} đã mời bạn ra khỏi phòng chat "${tenPhong}".`
      ]
    );

    // Emit socket event để thông báo cho thành viên bị kick
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    
    // Gửi thông báo real-time cho người bị kick
    const kickedSocketId = userSockets.get(memberId);
    if (kickedSocketId) {
      io.to(kickedSocketId).emit('notification', {
        type: 'kicked_from_chat',
        message: `Bạn đã bị chủ nhiệm ${tenCLB} mời ra khỏi phòng chat "${tenPhong}"`,
        roomId
      });
    }
    
    // Thông báo cho tất cả trong phòng
    io.to(`room_${roomId}`).emit('member_kicked', { 
      roomId, 
      memberId,
      message: `Một thành viên đã bị mời ra khỏi phòng chat`
    });

    res.json({ message: 'Đã kick thành viên khỏi phòng chat' });
  } catch (error) {
    console.error('Kick member error:', error);
    res.status(500).json({ message: 'Lỗi kick thành viên', error: error.message });
  }
});

// Lấy thêm tin nhắn cũ (pagination)
router.get('/room/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { before_id, limit = 50 } = req.query;
    const userId = req.user.id;

    // Kiểm tra user có trong phòng chat không
    const [membership] = await db.query(
      'SELECT * FROM thanh_vien_phong_chat WHERE phong_chat_id = ? AND nguoi_dung_id = ?',
      [roomId, userId]
    );

    if (membership.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập phòng chat này' });
    }

    let query = `
      SELECT 
        tn.*,
        nd.email,
        nd.loai_nguoi_dung,
        COALESCE(sv.ho_ten, 'Admin/Chủ nhiệm') as ho_ten,
        sv.anh_dai_dien
      FROM tin_nhan tn
      JOIN nguoi_dung nd ON tn.nguoi_gui_id = nd.id
      LEFT JOIN sinh_vien sv ON nd.id = sv.nguoi_dung_id
      WHERE tn.phong_chat_id = ?
    `;
    
    const params = [roomId];
    
    if (before_id) {
      query += ' AND tn.id < ?';
      params.push(before_id);
    }
    
    query += ' ORDER BY tn.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [messages] = await db.query(query, params);

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Lỗi lấy tin nhắn', error: error.message });
  }
});

module.exports = router;
