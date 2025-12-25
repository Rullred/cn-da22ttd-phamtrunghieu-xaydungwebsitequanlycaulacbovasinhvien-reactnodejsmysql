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
              sv.ho_ten, sv.ma_sinh_vien, sv.lop, sv.khoa, sv.khoa_hoc, sv.anh_dai_dien
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

// Phê duyệt hàng loạt tài khoản
router.post('/approve-accounts-bulk', async (req, res) => {
  try {
    const { account_ids } = req.body;
    
    if (!account_ids || account_ids.length === 0) {
      return res.status(400).json({ message: 'Không có tài khoản nào được chọn' });
    }

    // Lấy thông tin tất cả tài khoản
    const [accounts] = await db.query(
      `SELECT nd.id, nd.email, sv.ho_ten
       FROM nguoi_dung nd
       LEFT JOIN sinh_vien sv ON nd.id = sv.nguoi_dung_id
       WHERE nd.id IN (?)`,
      [account_ids]
    );

    // Cập nhật trạng thái hàng loạt
    await db.query(
      'UPDATE nguoi_dung SET trang_thai = "da_duyet" WHERE id IN (?)',
      [account_ids]
    );

    // Gửi thông báo cho từng tài khoản
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');

    for (const account of accounts) {
      const { id } = account;

      // Tạo thông báo
      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
         VALUES (?, 'tai_khoan_duyet', 'Tài khoản đã được phê duyệt', 
                 'Chúc mừng! Tài khoản của bạn đã được Admin phê duyệt. Bạn có thể đăng nhập và sử dụng hệ thống.')`,
        [id]
      );

      // Gửi thông báo real-time
      const socketId = userSockets.get(id);
      if (socketId) {
        io.to(socketId).emit('notification', {
          type: 'tai_khoan_duyet',
          message: 'Tài khoản của bạn đã được phê duyệt'
        });
      }
    }

    res.json({ 
      message: `Đã phê duyệt thành công ${accounts.length} tài khoản`,
      count: accounts.length
    });
  } catch (error) {
    console.error('Bulk approve accounts error:', error);
    res.status(500).json({ message: 'Lỗi phê duyệt hàng loạt', error: error.message });
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

// Lấy thống kê chi tiết cho trang Thống kê
router.get('/detailed-statistics', async (req, res) => {
  try {
    const { period } = req.query; // week, month, year
    
    console.log('Period received:', period);
    
    // Xác định khoảng thời gian filter
    let dateFilterHoatDong = '';
    let dateFilterDangKy = '';
    let dateFilterHoatDongSimple = ''; // Không có alias
    let dateFilterDangKySimple = ''; // Không có alias
    
    if (period === 'week') {
      dateFilterHoatDong = 'AND hd.thoi_gian_bat_dau >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
      dateFilterDangKy = 'AND dk.ngay_dang_ky >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
      dateFilterHoatDongSimple = 'AND thoi_gian_bat_dau >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
      dateFilterDangKySimple = 'AND ngay_dang_ky >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
    } else if (period === 'month') {
      dateFilterHoatDong = 'AND hd.thoi_gian_bat_dau >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
      dateFilterDangKy = 'AND dk.ngay_dang_ky >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
      dateFilterHoatDongSimple = 'AND thoi_gian_bat_dau >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
      dateFilterDangKySimple = 'AND ngay_dang_ky >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
    } else if (period === 'year') {
      dateFilterHoatDong = 'AND hd.thoi_gian_bat_dau >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
      dateFilterDangKy = 'AND dk.ngay_dang_ky >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
      dateFilterHoatDongSimple = 'AND thoi_gian_bat_dau >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
      dateFilterDangKySimple = 'AND ngay_dang_ky >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
    }
    
    // Tổng sinh viên (không filter theo thời gian - luôn hiển thị tổng)
    const [sinhVienCount] = await db.query('SELECT COUNT(*) as total FROM sinh_vien');
    
    // Tổng hoạt động đã tổ chức (đã được duyệt) - filter theo period
    const [hoatDongDaToChuc] = await db.query(`
      SELECT COUNT(DISTINCT id) as total FROM hoat_dong 
      WHERE trang_thai_duyet = 'da_duyet' ${dateFilterHoatDongSimple}
    `);
    
    // Tổng lượt tham gia (đăng ký hoàn thành) - filter theo period
    // Chỉ đếm đăng ký có hoạt động còn tồn tại
    const [luotThamGia] = await db.query(`
      SELECT COUNT(*) as total FROM dang_ky_hoat_dong dk
      INNER JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
      WHERE dk.trang_thai = 'hoan_thanh' ${dateFilterDangKySimple}
    `);
    
    // Tổng đăng ký (bao gồm cả đang tham gia) - filter theo period
    // Chỉ đếm đăng ký có hoạt động còn tồn tại
    const [tongDangKy] = await db.query(`
      SELECT COUNT(*) as total FROM dang_ky_hoat_dong dk
      INNER JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
      WHERE dk.trang_thai IN ('cho_duyet', 'dang_tham_gia', 'hoan_thanh') ${dateFilterDangKySimple}
    `);
    
    // Tỷ lệ hoàn thành
    const tyLeThamGia = tongDangKy[0].total > 0 
      ? Math.round((luotThamGia[0].total / tongDangKy[0].total) * 100) 
      : 0;
    
    // Thống kê theo tháng (12 tháng gần nhất) - đã sửa lỗi GROUP BY
    const [hoatDongTheoThang] = await db.query(`
      SELECT 
        DATE_FORMAT(thoi_gian_bat_dau, '%Y-%m') as thang,
        COUNT(*) as so_hoat_dong
      FROM hoat_dong
      WHERE thoi_gian_bat_dau >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        AND trang_thai_duyet = 'da_duyet'
      GROUP BY DATE_FORMAT(thoi_gian_bat_dau, '%Y-%m')
      ORDER BY thang ASC
    `);
    
    // Thống kê theo CLB - filter theo period
    const [thongKeTheoCLB] = await db.query(`
      SELECT 
        clb.ten_clb,
        COUNT(DISTINCT hd.id) as so_hoat_dong,
        COUNT(DISTINCT dk.id) as so_dang_ky
      FROM cau_lac_bo clb
      LEFT JOIN hoat_dong hd ON clb.id = hd.cau_lac_bo_id AND hd.trang_thai_duyet = 'da_duyet' ${dateFilterHoatDong}
      LEFT JOIN dang_ky_hoat_dong dk ON hd.id = dk.hoat_dong_id AND dk.trang_thai IN ('dang_tham_gia', 'hoan_thanh') ${dateFilterDangKy}
      WHERE clb.trang_thai = 'hoat_dong'
      GROUP BY clb.id, clb.ten_clb
      ORDER BY so_hoat_dong DESC
      LIMIT 10
    `);
    
    // Thống kê theo mục đích hoạt động - filter theo period
    const [thongKeTheoMucDich] = await db.query(`
      SELECT 
        muc_dich,
        COUNT(*) as so_luong
      FROM hoat_dong hd
      WHERE hd.trang_thai_duyet = 'da_duyet' AND hd.muc_dich IS NOT NULL ${dateFilterHoatDong}
      GROUP BY muc_dich
      ORDER BY so_luong DESC
    `);
    
    // Hoạt động gần đây - filter theo period
    const [hoatDongGanDay] = await db.query(`
      SELECT 
        hd.id,
        hd.ten_hoat_dong,
        hd.thoi_gian_bat_dau,
        hd.trang_thai,
        COALESCE(clb.ten_clb, hd.don_vi_phu_trach) as don_vi,
        (SELECT COUNT(*) FROM dang_ky_hoat_dong WHERE hoat_dong_id = hd.id AND trang_thai IN ('dang_tham_gia', 'hoan_thanh')) as so_tham_gia
      FROM hoat_dong hd
      LEFT JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
      WHERE hd.trang_thai_duyet = 'da_duyet' ${dateFilterHoatDong}
      ORDER BY hd.thoi_gian_bat_dau DESC
      LIMIT 10
    `);
    
    // Sinh viên tích cực nhất - filter theo period
    const [topSinhVien] = await db.query(`
      SELECT 
        sv.ho_ten,
        sv.ma_sinh_vien,
        sv.lop,
        COUNT(dk.id) as so_hoat_dong
      FROM sinh_vien sv
      JOIN dang_ky_hoat_dong dk ON sv.id = dk.sinh_vien_id
      WHERE dk.trang_thai = 'hoan_thanh' ${dateFilterDangKy}
      GROUP BY sv.id, sv.ho_ten, sv.ma_sinh_vien, sv.lop
      ORDER BY so_hoat_dong DESC
      LIMIT 5
    `);

    res.json({
      tong_quan: {
        tong_sinh_vien: sinhVienCount[0].total,
        hoat_dong_da_to_chuc: hoatDongDaToChuc[0].total,
        luot_tham_gia: luotThamGia[0].total,
        ty_le_tham_gia: tyLeThamGia
      },
      hoat_dong_theo_thang: hoatDongTheoThang,
      thong_ke_theo_clb: thongKeTheoCLB,
      thong_ke_theo_muc_dich: thongKeTheoMucDich,
      hoat_dong_gan_day: hoatDongGanDay,
      top_sinh_vien: topSinhVien
    });
  } catch (error) {
    console.error('Lỗi lấy thống kê chi tiết:', error);
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
    const { email, mat_khau, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai } = req.body;
    
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
        `INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nguoi_dung_id, ho_ten, ma_sinh_vien, lop || null, khoa || null, khoa_hoc || null, so_dien_thoai || null]
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
    const { ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, email } = req.body;
    
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
       SET ho_ten = ?, ma_sinh_vien = ?, lop = ?, khoa = ?, khoa_hoc = ?, so_dien_thoai = ?
       WHERE id = ?`,
      [ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, id]
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

// ==================== TẠO HOẠT ĐỘNG (ADMIN) ====================

// Admin tạo hoạt động - tự động được duyệt, sinh viên đăng ký tự động duyệt lần 1
router.post('/create-activity', async (req, res) => {
  try {
    const { 
      ten_hoat_dong, 
      mo_ta, 
      thoi_gian_bat_dau, 
      thoi_gian_ket_thuc, 
      dia_diem, 
      quy_dinh_trang_phuc, 
      so_luong_toi_da,
      muc_dich,
      don_vi_phu_trach,
      diem_ren_luyen
    } = req.body;

    console.log('Admin tạo hoạt động:', { ten_hoat_dong, don_vi_phu_trach, muc_dich, diem_ren_luyen });

    // Validate dữ liệu bắt buộc
    if (!ten_hoat_dong || !thoi_gian_bat_dau || !thoi_gian_ket_thuc || !dia_diem) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    if (!don_vi_phu_trach) {
      return res.status(400).json({ message: 'Vui lòng nhập đơn vị phụ trách' });
    }

    // Tạo hoạt động với trạng thái đã duyệt (Admin tạo không cần duyệt)
    // is_admin_activity = true để sinh viên đăng ký tự động được duyệt lần 1
    const [result] = await db.query(
      `INSERT INTO hoat_dong (
        cau_lac_bo_id, don_vi_phu_trach, is_admin_activity, ten_hoat_dong, mo_ta, 
        thoi_gian_bat_dau, thoi_gian_ket_thuc, dia_diem, quy_dinh_trang_phuc, 
        so_luong_toi_da, muc_dich, diem_ren_luyen, trang_thai, trang_thai_duyet
      ) VALUES (NULL, ?, TRUE, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sap_dien_ra', 'da_duyet')`,
      [
        don_vi_phu_trach,
        ten_hoat_dong,
        mo_ta || null,
        thoi_gian_bat_dau,
        thoi_gian_ket_thuc,
        dia_diem,
        quy_dinh_trang_phuc || null,
        so_luong_toi_da || 0,
        muc_dich || null,
        diem_ren_luyen || 0
      ]
    );

    const hoat_dong_id = result.insertId;
    console.log('Đã tạo hoạt động ID:', hoat_dong_id);

    // Thông báo cho TẤT CẢ SINH VIÊN: Có hoạt động mới từ Admin
    const [allStudents] = await db.query(
      `SELECT nguoi_dung_id FROM sinh_vien`
    );

    const io = req.app.get('io');
    const messageToStudents = `Hoạt động mới "${ten_hoat_dong}" từ ${don_vi_phu_trach}. Đăng ký ngay để tham gia! (+${diem_ren_luyen || 0} điểm rèn luyện)`;
    
    for (const student of allStudents) {
      try {
        await db.query(
          `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
           VALUES (?, 'hoat_dong_moi', 'Hoạt động mới', ?, ?)`,
          [student.nguoi_dung_id, messageToStudents, `/sinhvien/hoat-dong/${hoat_dong_id}`]
        );
      } catch (notifError) {
        console.log('Lỗi tạo thông báo cho sinh viên:', student.nguoi_dung_id, notifError.message);
      }

      // Gửi socket notification
      if (io) {
        try {
          io.to(`user_${student.nguoi_dung_id}`).emit('new_notification', {
            loai_thong_bao: 'hoat_dong_moi',
            tieu_de: 'Hoạt động mới',
            noi_dung: messageToStudents,
            lien_ket: `/sinhvien/hoat-dong/${hoat_dong_id}`
          });
        } catch (socketError) {
          console.log('Lỗi gửi socket notification:', socketError.message);
        }
      }
    }

    console.log('Tạo hoạt động thành công');
    res.json({ 
      message: 'Tạo hoạt động thành công',
      hoat_dong_id 
    });
  } catch (error) {
    console.error('Lỗi tạo hoạt động:', error);
    res.status(500).json({ message: 'Lỗi tạo hoạt động', error: error.message });
  }
});

// Lấy danh sách hoạt động Admin đã tạo
router.get('/my-activities', async (req, res) => {
  try {
    const [activities] = await db.query(
      `SELECT hd.*, 
              (SELECT COUNT(*) FROM dang_ky_hoat_dong WHERE hoat_dong_id = hd.id AND trang_thai = 'dang_tham_gia') as so_dang_ky,
              (SELECT COUNT(*) FROM dang_ky_hoat_dong WHERE hoat_dong_id = hd.id AND trang_thai = 'hoan_thanh') as so_hoan_thanh
       FROM hoat_dong hd
       WHERE hd.is_admin_activity = TRUE
       ORDER BY hd.created_at DESC`
    );
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách hoạt động', error: error.message });
  }
});

// Lấy danh sách sinh viên đăng ký hoạt động Admin
router.get('/activity-registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [registrations] = await db.query(
      `SELECT dk.*, sv.ho_ten, sv.ma_sinh_vien, sv.lop, sv.khoa, sv.anh_dai_dien
       FROM dang_ky_hoat_dong dk
       JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
       WHERE dk.hoat_dong_id = ?
       ORDER BY dk.ngay_dang_ky DESC`,
      [id]
    );
    
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đăng ký', error: error.message });
  }
});

// Xác nhận hoàn thành (duyệt lần 2) cho sinh viên
router.post('/confirm-completion/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin đăng ký và điểm rèn luyện của hoạt động
    const [registrations] = await db.query(
      `SELECT dk.*, sv.id as sv_id, sv.nguoi_dung_id, sv.tong_diem_ren_luyen,
              hd.ten_hoat_dong, hd.diem_ren_luyen
       FROM dang_ky_hoat_dong dk
       JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       WHERE dk.id = ?`,
      [id]
    );
    
    if (registrations.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký' });
    }
    
    const reg = registrations[0];
    const diemCong = reg.diem_ren_luyen || 0;
    
    // Cập nhật trạng thái thành hoàn thành
    await db.query(
      `UPDATE dang_ky_hoat_dong 
       SET trang_thai = 'hoan_thanh', ngay_duyet_lan_2 = NOW() 
       WHERE id = ?`,
      [id]
    );
    
    // Cộng điểm rèn luyện cho sinh viên
    if (diemCong > 0) {
      await db.query(
        `UPDATE sinh_vien SET tong_diem_ren_luyen = tong_diem_ren_luyen + ? WHERE id = ?`,
        [diemCong, reg.sv_id]
      );
    }
    
    // Gửi thông báo
    await db.query(
      `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
       VALUES (?, 'duyet_hoat_dong', 'Xác nhận hoàn thành hoạt động', ?)`,
      [reg.nguoi_dung_id, `Bạn đã hoàn thành hoạt động "${reg.ten_hoat_dong}". +${diemCong} điểm rèn luyện!`]
    );
    
    res.json({ message: 'Xác nhận hoàn thành thành công', diem_cong: diemCong });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xác nhận hoàn thành', error: error.message });
  }
});

// API lấy top sinh viên theo điểm rèn luyện
router.get('/top-students', async (req, res) => {
  try {
    // Lấy top 50 sinh viên có điểm rèn luyện cao nhất
    const [students] = await db.query(
      `SELECT sv.id, sv.ho_ten, sv.ma_sinh_vien, sv.lop, sv.khoa, sv.anh_dai_dien,
              sv.tong_diem_ren_luyen,
              (SELECT COUNT(*) FROM dang_ky_hoat_dong WHERE sinh_vien_id = sv.id AND trang_thai = 'hoan_thanh') as so_hoat_dong
       FROM sinh_vien sv
       WHERE sv.tong_diem_ren_luyen > 0
       ORDER BY sv.tong_diem_ren_luyen DESC, so_hoat_dong DESC
       LIMIT 50`
    );
    
    // Thống kê tổng quan
    const [statsResult] = await db.query(
      `SELECT 
        COUNT(DISTINCT sv.id) as total_students,
        SUM(sv.tong_diem_ren_luyen) as total_points,
        (SELECT COUNT(*) FROM dang_ky_hoat_dong WHERE trang_thai = 'hoan_thanh') as total_activities
       FROM sinh_vien sv
       WHERE sv.tong_diem_ren_luyen > 0`
    );
    
    const stats = {
      totalStudents: statsResult[0]?.total_students || 0,
      totalPoints: statsResult[0]?.total_points || 0,
      totalActivities: statsResult[0]?.total_activities || 0
    };
    
    res.json({ students, stats });
  } catch (error) {
    console.error('Lỗi lấy top sinh viên:', error);
    res.status(500).json({ message: 'Lỗi lấy top sinh viên', error: error.message });
  }
});

// Xác nhận hoàn thành hàng loạt
router.post('/confirm-completion-bulk', async (req, res) => {
  try {
    const { registration_ids } = req.body;
    
    if (!registration_ids || registration_ids.length === 0) {
      return res.status(400).json({ message: 'Không có đăng ký nào được chọn' });
    }
    
    // Lấy thông tin đăng ký và điểm rèn luyện
    const [registrations] = await db.query(
      `SELECT dk.*, sv.id as sv_id, sv.nguoi_dung_id, hd.ten_hoat_dong, hd.diem_ren_luyen
       FROM dang_ky_hoat_dong dk
       JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       WHERE dk.id IN (?)`,
      [registration_ids]
    );
    
    // Cập nhật trạng thái hàng loạt
    await db.query(
      `UPDATE dang_ky_hoat_dong 
       SET trang_thai = 'hoan_thanh', ngay_duyet_lan_2 = NOW() 
       WHERE id IN (?)`,
      [registration_ids]
    );
    
    // Cộng điểm và gửi thông báo cho từng sinh viên
    for (const reg of registrations) {
      const diemCong = reg.diem_ren_luyen || 0;
      
      // Cộng điểm rèn luyện
      if (diemCong > 0) {
        await db.query(
          `UPDATE sinh_vien SET tong_diem_ren_luyen = tong_diem_ren_luyen + ? WHERE id = ?`,
          [diemCong, reg.sv_id]
        );
      }
      
      // Gửi thông báo
      try {
        await db.query(
          `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
           VALUES (?, 'duyet_hoat_dong', 'Xác nhận hoàn thành hoạt động', ?)`,
          [reg.nguoi_dung_id, `Bạn đã hoàn thành hoạt động "${reg.ten_hoat_dong}". +${diemCong} điểm rèn luyện!`]
        );
      } catch (e) {
        console.log('Lỗi gửi thông báo:', e.message);
      }
    }
    
    res.json({ message: `Đã xác nhận hoàn thành ${registration_ids.length} sinh viên` });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xác nhận hoàn thành', error: error.message });
  }
});

// Xóa hoạt động Admin đã tạo
router.delete('/activity/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra xem hoạt động có phải do Admin tạo không
    const [activities] = await db.query(
      'SELECT * FROM hoat_dong WHERE id = ? AND is_admin_activity = TRUE',
      [id]
    );
    
    if (activities.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hoạt động hoặc bạn không có quyền xóa' });
    }
    
    const activity = activities[0];
    
    // Kiểm tra xem đã có sinh viên đăng ký và hoàn thành chưa
    const [completedRegs] = await db.query(
      'SELECT COUNT(*) as count FROM dang_ky_hoat_dong WHERE hoat_dong_id = ? AND trang_thai = "hoan_thanh"',
      [id]
    );
    
    if (completedRegs[0].count > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa hoạt động đã có sinh viên hoàn thành. Vui lòng liên hệ quản trị viên hệ thống.' 
      });
    }
    
    // Xóa các đăng ký liên quan trước (vì không có CASCADE DELETE)
    await db.query('DELETE FROM dang_ky_hoat_dong WHERE hoat_dong_id = ?', [id]);
    
    // Xóa hoạt động
    await db.query('DELETE FROM hoat_dong WHERE id = ?', [id]);
    
    res.json({ message: 'Đã xóa hoạt động thành công' });
  } catch (error) {
    console.error('Lỗi xóa hoạt động:', error);
    res.status(500).json({ message: 'Lỗi xóa hoạt động', error: error.message });
  }
});

module.exports = router;
