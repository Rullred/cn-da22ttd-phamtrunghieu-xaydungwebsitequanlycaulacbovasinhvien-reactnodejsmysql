const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Tất cả routes dưới đây yêu cầu đăng nhập và là Admin
router.use(authenticateToken);
router.use(isAdmin);

// Lấy danh sách tài khoản chờ phê duyệt
router.get('/pending-accounts', async (req, res) => {
  try {
    const [accounts] = await db.query(
      `SELECT nd.id, nd.email, nd.loai_nguoi_dung, nd.trang_thai, nd.created_at,
              sv.ho_ten, sv.ma_sinh_vien, sv.lop, sv.khoa, sv.nam_sinh, sv.anh_dai_dien
       FROM nguoi_dung nd
       LEFT JOIN sinh_vien sv ON nd.id = sv.nguoi_dung_id
       WHERE nd.trang_thai = 'cho_duyet'
       ORDER BY nd.created_at DESC`
    );

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách', error: error.message });
  }
});

// Phê duyệt tài khoản
router.post('/approve-account/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Cập nhật trạng thái
    await db.query(
      'UPDATE nguoi_dung SET trang_thai = "da_duyet" WHERE id = ?',
      [id]
    );

    // Lấy thông tin người dùng
    const [users] = await db.query(
      'SELECT * FROM nguoi_dung WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Tạo thông báo cho người dùng
    await db.query(
      `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
       VALUES (?, 'tai_khoan_duyet', 'Tài khoản đã được phê duyệt', 
               'Chúc mừng! Tài khoản của bạn đã được Admin phê duyệt. Bạn có thể đăng nhập và sử dụng hệ thống.')`,
      [id]
    );

    // Gửi thông báo real-time
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const socketId = userSockets.get(id);
    
    if (socketId) {
      io.to(socketId).emit('notification', {
        type: 'tai_khoan_duyet',
        message: 'Tài khoản của bạn đã được phê duyệt'
      });
    }

    res.json({ message: 'Phê duyệt tài khoản thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi phê duyệt', error: error.message });
  }
});

// Từ chối tài khoản
router.post('/reject-account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ly_do } = req.body;

    // Cập nhật trạng thái
    await db.query(
      'UPDATE nguoi_dung SET trang_thai = "tu_choi" WHERE id = ?',
      [id]
    );

    // Tạo thông báo
    await db.query(
      `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
       VALUES (?, 'tai_khoan_tu_choi', 'Tài khoản không được phê duyệt', ?)`,
      [id, ly_do || 'Tài khoản của bạn không được phê duyệt. Vui lòng liên hệ Admin để biết thêm chi tiết.']
    );

    // Gửi thông báo real-time
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const socketId = userSockets.get(id);
    
    if (socketId) {
      io.to(socketId).emit('notification', {
        type: 'tai_khoan_tu_choi',
        message: 'Tài khoản của bạn không được phê duyệt'
      });
    }

    res.json({ message: 'Từ chối tài khoản thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi từ chối', error: error.message });
  }
});

// Tạo câu lạc bộ mới
router.post('/create-club', async (req, res) => {
  try {
    const { ten_clb, mo_ta, ngay_thanh_lap } = req.body;

    const [result] = await db.query(
      `INSERT INTO cau_lac_bo (ten_clb, mo_ta, ngay_thanh_lap, trang_thai)
       VALUES (?, ?, ?, 'hoat_dong')`,
      [ten_clb, mo_ta, ngay_thanh_lap]
    );

    res.json({ 
      message: 'Tạo câu lạc bộ thành công',
      clb_id: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo CLB', error: error.message });
  }
});

// Tạo tài khoản Chủ nhiệm/Phó chủ nhiệm cho CLB
router.post('/create-club-admin', async (req, res) => {
  try {
    const { email, mat_khau, loai_nguoi_dung, clb_id } = req.body;

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(mat_khau, 10);

    // Tạo tài khoản
    const [result] = await db.query(
      `INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai)
       VALUES (?, ?, ?, 'da_duyet')`,
      [email, hashedPassword, loai_nguoi_dung]
    );

    const nguoi_dung_id = result.insertId;

    // Gán vào CLB
    if (loai_nguoi_dung === 'chu_nhiem') {
      await db.query(
        'UPDATE cau_lac_bo SET chu_nhiem_id = ? WHERE id = ?',
        [nguoi_dung_id, clb_id]
      );
    }

    res.json({ 
      message: 'Tạo tài khoản và gán vào CLB thành công',
      nguoi_dung_id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo tài khoản', error: error.message });
  }
});

// Lấy danh sách tất cả CLB
router.get('/clubs', async (req, res) => {
  try {
    const [clubs] = await db.query(
      `SELECT clb.*, 
              cn.email as chu_nhiem_email
       FROM cau_lac_bo clb
       LEFT JOIN nguoi_dung cn ON clb.chu_nhiem_id = cn.id
       ORDER BY clb.created_at DESC`
    );

    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách CLB', error: error.message });
  }
});

// Xóa CLB
router.delete('/club/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM cau_lac_bo WHERE id = ?', [id]);

    res.json({ message: 'Xóa CLB thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa CLB', error: error.message });
  }
});

// Lấy thống kê tổng quan
router.get('/statistics', async (req, res) => {
  try {
    const [sinhVienCount] = await db.query(
      'SELECT COUNT(*) as total FROM sinh_vien'
    );
    
    const [clbCount] = await db.query(
      'SELECT COUNT(*) as total FROM cau_lac_bo WHERE trang_thai = "hoat_dong"'
    );
    
    const [hoatDongCount] = await db.query(
      'SELECT COUNT(*) as total FROM hoat_dong WHERE trang_thai = "sap_dien_ra"'
    );
    
    const [pendingCount] = await db.query(
      'SELECT COUNT(*) as total FROM nguoi_dung WHERE trang_thai = "cho_duyet"'
    );

    const [pendingActivitiesCount] = await db.query(
      'SELECT COUNT(*) as total FROM hoat_dong WHERE trang_thai_duyet = "cho_duyet"'
    );

    res.json({
      tong_sinh_vien: sinhVienCount[0].total,
      tong_clb: clbCount[0].total,
      hoat_dong_sap_toi: hoatDongCount[0].total,
      tai_khoan_cho_duyet: pendingCount[0].total,
      hoat_dong_cho_duyet: pendingActivitiesCount[0].total
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thống kê', error: error.message });
  }
});

// Lấy danh sách hoạt động chờ phê duyệt
router.get('/pending-activities', async (req, res) => {
  try {
    const [activities] = await db.query(
      `SELECT hd.*, clb.ten_clb
       FROM hoat_dong hd
       JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
       WHERE hd.trang_thai_duyet = 'cho_duyet'
       ORDER BY hd.created_at DESC`
    );

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách hoạt động', error: error.message });
  }
});

// Phê duyệt hoạt động
router.post('/approve-activity/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Phê duyệt hoạt động ID:', id);

    // Cập nhật trạng thái
    await db.query(
      'UPDATE hoat_dong SET trang_thai_duyet = "da_duyet" WHERE id = ?',
      [id]
    );
    console.log('Đã cập nhật trạng thái hoạt động');

    // Lấy thông tin hoạt động
    const [activities] = await db.query(
      'SELECT * FROM hoat_dong WHERE id = ?',
      [id]
    );
    console.log('Hoạt động:', activities);

    if (activities.length === 0) {
      return res.status(404).json({ message: 'Hoạt động không tồn tại' });
    }

    const activity = activities[0];

    // Lấy thông tin CLB
    const [clubs] = await db.query(
      'SELECT chu_nhiem_id, ten_clb FROM cau_lac_bo WHERE id = ?',
      [activity.cau_lac_bo_id]
    );
    console.log('CLB:', clubs);

    if (clubs.length > 0) {
      // Thông báo cho CHỦ NHIỆM CLB: Hoạt động đã được Admin phê duyệt
      const messageToClub = `Hoạt động "${activity.ten_hoat_dong}" đã được Admin phê duyệt. Sinh viên đã có thể xem và đăng ký hoạt động này.`;
      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
         VALUES (?, 'duyet_hoat_dong', 'Hoạt động đã được phê duyệt', ?, ?)`,
        [clubs[0].chu_nhiem_id, messageToClub, `/caulacbo/hoat-dong/${id}`]
      );
      console.log('Đã tạo thông báo cho chủ nhiệm CLB');

      // Thông báo cho TẤT CẢ SINH VIÊN: Có hoạt động mới
      const [allStudents] = await db.query(
        `SELECT nguoi_dung_id FROM sinh_vien`
      );
      console.log('Số lượng sinh viên:', allStudents.length);

      const io = req.app.get('io');
      const messageToStudents = `Hoạt động mới "${activity.ten_hoat_dong}" từ ${clubs[0].ten_clb}. Đăng ký ngay để tham gia!`;
      
      for (const student of allStudents) {
        try {
          await db.query(
            `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
             VALUES (?, 'hoat_dong_moi', 'Hoạt động mới', ?, ?)`,
            [student.nguoi_dung_id, messageToStudents, `/sinhvien/hoat-dong/${id}`]
          );
        } catch (notifError) {
          console.log('Lỗi tạo thông báo cho sinh viên:', student.nguoi_dung_id, notifError.message);
        }

        // Gửi socket notification (không blocking)
        if (io) {
          try {
            io.to(`user_${student.nguoi_dung_id}`).emit('new_notification', {
              loai_thong_bao: 'hoat_dong_moi',
              tieu_de: 'Hoạt động mới',
              noi_dung: messageToStudents,
              lien_ket: `/sinhvien/hoat-dong/${id}`
            });
          } catch (socketError) {
            console.log('Lỗi gửi socket notification:', socketError.message);
          }
        }
      }
      console.log('Đã gửi thông báo cho sinh viên');
    }

    console.log('Phê duyệt hoạt động thành công');
    res.json({ message: 'Phê duyệt hoạt động thành công' });
  } catch (error) {
    console.error('Lỗi phê duyệt hoạt động:', error);
    res.status(500).json({ message: 'Lỗi phê duyệt hoạt động', error: error.message });
  }
});

// Từ chối hoạt động
router.post('/reject-activity/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ly_do } = req.body;

    // Cập nhật trạng thái
    await db.query(
      'UPDATE hoat_dong SET trang_thai_duyet = "tu_choi" WHERE id = ?',
      [id]
    );

    // Lấy thông tin hoạt động
    const [activities] = await db.query(
      'SELECT hd.*, clb.chu_nhiem_id, clb.ten_clb FROM hoat_dong hd JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id WHERE hd.id = ?',
      [id]
    );

    if (activities.length === 0) {
      return res.status(404).json({ message: 'Hoạt động không tồn tại' });
    }

    const activity = activities[0];

    // Gửi thông báo cho Chủ nhiệm CLB
    await db.query(
      `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
       VALUES (?, 'hoat_dong_tu_choi', 'Hoạt động không được phê duyệt', ?, ?)`,
      [activity.chu_nhiem_id, `Hoạt động "${activity.ten_hoat_dong}" không được phê duyệt. Lý do: ${ly_do || 'Không đáp ứng yêu cầu'}`, `/caulacbo/activities`]
    );

    res.json({ message: 'Đã từ chối hoạt động' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi từ chối hoạt động', error: error.message });
  }
});

// ==================== QUẢN LÝ SINH VIÊN ====================

// Lấy danh sách sinh viên (có tìm kiếm)
router.get('/students', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT sv.*, nd.email, nd.trang_thai, nd.created_at
      FROM sinh_vien sv
      JOIN nguoi_dung nd ON sv.nguoi_dung_id = nd.id
    `;
    
    let params = [];
    
    if (search) {
      query += ` WHERE sv.ma_sinh_vien LIKE ? OR sv.ho_ten LIKE ? OR sv.lop LIKE ?`;
      const searchPattern = `%${search}%`;
      params = [searchPattern, searchPattern, searchPattern];
    }
    
    query += ` ORDER BY sv.created_at DESC`;
    
    const [students] = await db.query(query, params);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách sinh viên', error: error.message });
  }
});

// Lấy chi tiết sinh viên
router.get('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [students] = await db.query(
      `SELECT sv.*, nd.email, nd.trang_thai, nd.created_at
       FROM sinh_vien sv
       JOIN nguoi_dung nd ON sv.nguoi_dung_id = nd.id
       WHERE sv.id = ?`,
      [id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }
    
    res.json(students[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông tin sinh viên', error: error.message });
  }
});

// Tạo sinh viên mới
router.post('/students', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { email, mat_khau, ho_ten, ma_sinh_vien, lop, khoa, nam_sinh, so_dien_thoai } = req.body;
    
    console.log('Tạo sinh viên:', { email, ma_sinh_vien, ho_ten });
    
    // Validate dữ liệu bắt buộc
    if (!email || !mat_khau || !ho_ten || !ma_sinh_vien) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    
    // Validate định dạng email
    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    // Bắt đầu transaction
    await connection.beginTransaction();

    try {
      // Kiểm tra email đã tồn tại
      const [existingUsers] = await connection.query(
        'SELECT id FROM nguoi_dung WHERE email = ?',
        [email]
      );
      
      if (existingUsers.length > 0) {
        console.log('Email đã tồn tại:', email);
        await connection.rollback();
        return res.status(400).json({ message: 'Email đã tồn tại' });
      }
      
      // Kiểm tra MSSV đã tồn tại
      const [existingStudents] = await connection.query(
        'SELECT id FROM sinh_vien WHERE ma_sinh_vien = ?',
        [ma_sinh_vien]
      );
      
      if (existingStudents.length > 0) {
        console.log('MSSV đã tồn tại:', ma_sinh_vien);
        await connection.rollback();
        return res.status(400).json({ message: 'Mã sinh viên đã tồn tại' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(mat_khau, 10);
      
      // Tạo tài khoản người dùng
      const [userResult] = await connection.query(
        'INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) VALUES (?, ?, "sinh_vien", "da_duyet")',
        [email, hashedPassword]
      );
      
      const nguoi_dung_id = userResult.insertId;
      console.log('Đã tạo nguoi_dung:', nguoi_dung_id);
      
      // Tạo thông tin sinh viên
      await connection.query(
        `INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, nam_sinh, so_dien_thoai)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nguoi_dung_id, ho_ten, ma_sinh_vien, lop || null, khoa || null, nam_sinh || null, so_dien_thoai || null]
      );
      
      // Commit transaction
      await connection.commit();
      console.log('Tạo sinh viên thành công:', ma_sinh_vien);
      res.json({ message: 'Tạo sinh viên thành công' });
      
    } catch (error) {
      // Rollback nếu có lỗi
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Lỗi tạo sinh viên:', error);
    res.status(500).json({ message: 'Lỗi tạo sinh viên', error: error.message });
  } finally {
    connection.release();
  }
});

// Cập nhật sinh viên
router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ho_ten, ma_sinh_vien, lop, khoa, nam_sinh, so_dien_thoai, email } = req.body;
    
    // Lấy thông tin sinh viên hiện tại
    const [currentStudent] = await db.query(
      'SELECT nguoi_dung_id, ma_sinh_vien FROM sinh_vien WHERE id = ?',
      [id]
    );
    
    if (currentStudent.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }
    
    // Kiểm tra MSSV trùng (nếu thay đổi)
    if (ma_sinh_vien !== currentStudent[0].ma_sinh_vien) {
      const [existingStudents] = await db.query(
        'SELECT id FROM sinh_vien WHERE ma_sinh_vien = ? AND id != ?',
        [ma_sinh_vien, id]
      );
      
      if (existingStudents.length > 0) {
        return res.status(400).json({ message: 'Mã sinh viên đã tồn tại' });
      }
    }
    
    // Cập nhật thông tin sinh viên
    await db.query(
      `UPDATE sinh_vien 
       SET ho_ten = ?, ma_sinh_vien = ?, lop = ?, khoa = ?, nam_sinh = ?, so_dien_thoai = ?
       WHERE id = ?`,
      [ho_ten, ma_sinh_vien, lop, khoa, nam_sinh, so_dien_thoai, id]
    );
    
    // Cập nhật email nếu có
    if (email) {
      // Validate định dạng email
      if (!email.includes('@')) {
        return res.status(400).json({ message: 'Email không hợp lệ' });
      }
      
      // Kiểm tra email trùng
      const [existingEmail] = await db.query(
        'SELECT id FROM nguoi_dung WHERE email = ? AND id != ?',
        [email, currentStudent[0].nguoi_dung_id]
      );
      
      if (existingEmail.length > 0) {
        return res.status(400).json({ message: 'Email đã tồn tại' });
      }
      
      await db.query(
        'UPDATE nguoi_dung SET email = ? WHERE id = ?',
        [email, currentStudent[0].nguoi_dung_id]
      );
    }
    
    res.json({ message: 'Cập nhật sinh viên thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật sinh viên', error: error.message });
  }
});

// Xóa sinh viên
router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy nguoi_dung_id
    const [student] = await db.query(
      'SELECT nguoi_dung_id FROM sinh_vien WHERE id = ?',
      [id]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }
    
    const nguoi_dung_id = student[0].nguoi_dung_id;
    
    // Xóa sinh viên trước (CASCADE sẽ xóa dang_ky_hoat_dong, thanh_vien_clb)
    await db.query('DELETE FROM sinh_vien WHERE id = ?', [id]);
    
    // Sau đó xóa tài khoản người dùng (CASCADE sẽ xóa thong_bao)
    await db.query('DELETE FROM nguoi_dung WHERE id = ?', [nguoi_dung_id]);
    
    res.json({ message: 'Xóa sinh viên thành công' });
  } catch (error) {
    console.error('Lỗi xóa sinh viên:', error);
    res.status(500).json({ message: 'Lỗi xóa sinh viên', error: error.message });
  }
});

module.exports = router;
