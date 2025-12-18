const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, isChuNhiemCLB } = require('../middleware/auth');

// Tất cả routes yêu cầu là Chủ nhiệm/Phó chủ nhiệm CLB
router.use(authenticateToken);
router.use(isChuNhiemCLB);

// Lấy thông tin CLB của Chủ nhiệm
router.get('/my-club', async (req, res) => {
  try {
    const [clubs] = await db.query(
      `SELECT * FROM cau_lac_bo 
       WHERE chu_nhiem_id = ?`,
      [req.user.id]
    );

    if (clubs.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy CLB' });
    }

    res.json(clubs[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông tin CLB', error: error.message });
  }
});

// Tạo hoạt động mới
// Tạo hoạt động mới
router.post('/create-activity', async (req, res) => {
  try {
    console.log('Tạo hoạt động - Request body:', req.body);
    console.log('User ID:', req.user.id);
    
    const { 
      ten_hoat_dong, 
      mo_ta, 
      thoi_gian_bat_dau, 
      thoi_gian_ket_thuc, 
      dia_diem, 
      quy_dinh_trang_phuc, 
      so_luong_toi_da 
    } = req.body;

    // Validation
    if (!ten_hoat_dong || !thoi_gian_bat_dau || !thoi_gian_ket_thuc || !dia_diem) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    // Validate thời gian kết thúc phải sau thời gian bắt đầu
    const startDate = new Date(thoi_gian_bat_dau);
    const endDate = new Date(thoi_gian_ket_thuc);
    
    if (endDate <= startDate) {
      console.error('Validation failed: End time must be after start time');
      return res.status(400).json({ message: 'Thời gian kết thúc phải sau thời gian bắt đầu' });
    }

    // Lấy CLB của Chủ nhiệm
    const [clubs] = await db.query(
      `SELECT id FROM cau_lac_bo 
       WHERE chu_nhiem_id = ?`,
      [req.user.id]
    );

    console.log('CLB tìm thấy:', clubs);

    if (clubs.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy CLB của bạn' });
    }

    const cau_lac_bo_id = clubs[0].id;

    // Tạo hoạt động với trạng thái chờ duyệt
    const [result] = await db.query(
      `INSERT INTO hoat_dong (
        cau_lac_bo_id, ten_hoat_dong, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc,
        dia_diem, quy_dinh_trang_phuc, so_luong_toi_da, trang_thai, trang_thai_duyet
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sap_dien_ra', 'cho_duyet')`,
      [cau_lac_bo_id, ten_hoat_dong, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, 
       dia_diem, quy_dinh_trang_phuc, so_luong_toi_da || 0]
    );

    // Thông báo cho ADMIN: Cần phê duyệt hoạt động mới
    const [admins] = await db.query(
      `SELECT id FROM nguoi_dung WHERE loai_nguoi_dung = 'admin'`
    );

    const io = req.app.get('io');
    for (const admin of admins) {
      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
         VALUES (?, 'duyet_hoat_dong', 'Cần phê duyệt hoạt động mới', ?, ?)`,
        [admin.id, `Hoạt động "${ten_hoat_dong}" đang chờ phê duyệt. Vui lòng kiểm tra và phê duyệt để sinh viên có thể đăng ký.`, `/admin/phe-duyet`]
      );
    }

    res.json({ 
      message: 'Tạo hoạt động thành công! Vui lòng chờ Admin phê duyệt.',
      hoat_dong_id: result.insertId 
    });
  } catch (error) {
    console.error('Lỗi tạo hoạt động:', error);
    res.status(500).json({ message: 'Lỗi tạo hoạt động', error: error.message });
  }
});

// Lấy danh sách hoạt động của CLB
router.get('/activities', async (req, res) => {
  try {
    const [clubs] = await db.query(
      `SELECT id FROM cau_lac_bo 
       WHERE chu_nhiem_id = ?`,
      [req.user.id]
    );

    if (clubs.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy CLB' });
    }

    const [activities] = await db.query(
      `SELECT * FROM hoat_dong 
       WHERE cau_lac_bo_id = ?
       ORDER BY thoi_gian_bat_dau DESC`,
      [clubs[0].id]
    );

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách hoạt động', error: error.message });
  }
});

// Lấy danh sách đăng ký của một hoạt động
router.get('/activity-registrations/:hoat_dong_id', async (req, res) => {
  try {
    const { hoat_dong_id } = req.params;

    const [registrations] = await db.query(
      `SELECT 
         dk.*,
         dk.ngay_duyet as ngay_duyet_lan_1,
         sv.ho_ten, 
         sv.ma_sinh_vien, 
         sv.lop, 
         sv.khoa, 
         sv.anh_dai_dien,
         hd.ten_hoat_dong
       FROM dang_ky_hoat_dong dk
       JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       WHERE dk.hoat_dong_id = ?
       ORDER BY dk.ngay_dang_ky DESC`,
      [hoat_dong_id]
    );

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đăng ký', error: error.message });
  }
});

// Phê duyệt đăng ký hoạt động (Lần 1 - Cho phép tham gia)
router.post('/approve-registration/:id', async (req, res) => {
  try {
    const { id } = req.params; // DangKyHoatDong id

    // Lấy thông tin đăng ký
    const [regInfo] = await db.query(
      'SELECT hoat_dong_id, trang_thai FROM dang_ky_hoat_dong WHERE id = ?',
      [id]
    );

    if (regInfo.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký' });
    }

    const { hoat_dong_id, trang_thai } = regInfo[0];

    // Cập nhật trạng thái sang 'dang_tham_gia' (đã duyệt lần 1)
    await db.query(
      'UPDATE dang_ky_hoat_dong SET trang_thai = "dang_tham_gia", ngay_duyet_lan_1 = NOW() WHERE id = ?',
      [id]
    );

    // Nếu trạng thái cũ không phải "dang_tham_gia", tăng số lượng
    if (trang_thai !== 'dang_tham_gia') {
      await db.query(
        'UPDATE hoat_dong SET so_luong_da_dang_ky = so_luong_da_dang_ky + 1 WHERE id = ?',
        [hoat_dong_id]
      );
    }

    // Lấy thông tin để gửi thông báo
    const [info] = await db.query(
      `SELECT sv.nguoi_dung_id, sv.ho_ten, hd.ten_hoat_dong
       FROM dang_ky_hoat_dong dk
       JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       WHERE dk.id = ?`,
      [id]
    );

    if (info.length > 0) {
      const { nguoi_dung_id, ten_hoat_dong } = info[0];

      // Gửi thông báo
      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
         VALUES (?, 'duyet_hoat_dong', 'Đăng ký hoạt động được duyệt', ?)`,
        [nguoi_dung_id, `Bạn đã được phê duyệt tham gia hoạt động "${ten_hoat_dong}"`]
      );

      // Real-time notification
      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      const socketId = userSockets.get(nguoi_dung_id);
      
      if (socketId) {
        io.to(socketId).emit('notification', {
          type: 'duyet_hoat_dong',
          message: `Bạn đã được duyệt tham gia "${ten_hoat_dong}"`
        });
      }
    }

    res.json({ message: 'Phê duyệt thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi phê duyệt', error: error.message });
  }
});

// Từ chối đăng ký hoạt động
router.post('/reject-registration/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ly_do } = req.body;

    // Lấy thông tin đăng ký
    const [regInfo] = await db.query(
      'SELECT hoat_dong_id, trang_thai FROM dang_ky_hoat_dong WHERE id = ?',
      [id]
    );

    if (regInfo.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký' });
    }

    const { hoat_dong_id, trang_thai } = regInfo[0];

    await db.query(
      'UPDATE dang_ky_hoat_dong SET trang_thai = "tu_choi", ngay_duyet = NOW() WHERE id = ?',
      [id]
    );

    // Nếu trạng thái cũ là "da_duyet", giảm số lượng
    if (trang_thai === 'da_duyet') {
      await db.query(
        'UPDATE hoat_dong SET so_luong_da_dang_ky = GREATEST(so_luong_da_dang_ky - 1, 0) WHERE id = ?',
        [hoat_dong_id]
      );
    }

    // Lấy thông tin để gửi thông báo
    const [info] = await db.query(
      `SELECT sv.nguoi_dung_id, hd.ten_hoat_dong
       FROM dang_ky_hoat_dong dk
       JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       WHERE dk.id = ?`,
      [id]
    );

    if (info.length > 0) {
      const { nguoi_dung_id, ten_hoat_dong } = info[0];

      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
         VALUES (?, 'tu_choi_hoat_dong', 'Đăng ký hoạt động không được duyệt', ?)`,
        [nguoi_dung_id, `Đăng ký tham gia "${ten_hoat_dong}" không được duyệt. Lý do: ${ly_do || 'Không rõ'}`]
      );
    }

    res.json({ message: 'Từ chối thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi từ chối', error: error.message });
  }
});

// Xác nhận hoàn thành hoạt động (Lần 2 - Xác nhận đã tham gia)
router.post('/confirm-completion/:id', async (req, res) => {
  try {
    const { id } = req.params; // DangKyHoatDong id

    // Lấy thông tin đăng ký
    const [regInfo] = await db.query(
      'SELECT hoat_dong_id, trang_thai FROM dang_ky_hoat_dong WHERE id = ?',
      [id]
    );

    if (regInfo.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký' });
    }

    const { trang_thai } = regInfo[0];

    // Chỉ cho phép xác nhận nếu đã được duyệt lần 1
    if (trang_thai !== 'dang_tham_gia') {
      return res.status(400).json({ message: 'Sinh viên chưa được duyệt tham gia hoạt động' });
    }

    // Cập nhật trạng thái sang 'hoan_thanh' (đã duyệt lần 2)
    await db.query(
      'UPDATE dang_ky_hoat_dong SET trang_thai = "hoan_thanh", ngay_duyet_lan_2 = NOW() WHERE id = ?',
      [id]
    );

    // Lấy thông tin để gửi thông báo
    const [info] = await db.query(
      `SELECT sv.nguoi_dung_id, hd.ten_hoat_dong
       FROM dang_ky_hoat_dong dk
       JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       WHERE dk.id = ?`,
      [id]
    );

    if (info.length > 0) {
      const { nguoi_dung_id, ten_hoat_dong } = info[0];

      // Gửi thông báo
      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
         VALUES (?, 'duyet_hoat_dong', 'Hoàn thành hoạt động', ?)`,
        [nguoi_dung_id, `Bạn đã hoàn thành hoạt động "${ten_hoat_dong}". Cảm ơn bạn đã tham gia!`]
      );

      // Real-time notification
      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      const socketId = userSockets.get(nguoi_dung_id);
      
      if (socketId) {
        io.to(socketId).emit('notification', {
          type: 'duyet_hoat_dong',
          message: `Bạn đã hoàn thành hoạt động "${ten_hoat_dong}"`
        });
      }
    }

    res.json({ message: 'Xác nhận hoàn thành thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xác nhận', error: error.message });
  }
});

// Xuất danh sách sinh viên đã hoàn thành hoạt động
router.get('/completed-participants/:hoat_dong_id', async (req, res) => {
  try {
    const { hoat_dong_id } = req.params;

    const [participants] = await db.query(
      `SELECT 
         dk.id,
         dk.ngay_dang_ky,
         dk.ngay_duyet_lan_1,
         dk.ngay_duyet_lan_2,
         sv.ho_ten,
         sv.ma_sinh_vien,
         sv.lop,
         sv.khoa,
         sv.khoa_hoc,
         sv.anh_dai_dien,
         hd.ten_hoat_dong
       FROM dang_ky_hoat_dong dk
       JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       WHERE dk.hoat_dong_id = ? AND dk.trang_thai = 'hoan_thanh'
       ORDER BY dk.ngay_duyet_lan_2 DESC`,
      [hoat_dong_id]
    );

    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách', error: error.message });
  }
});

// Lấy danh sách yêu cầu tham gia CLB
router.get('/member-requests', async (req, res) => {
  try {
    const [clubs] = await db.query(
      `SELECT id FROM cau_lac_bo 
       WHERE chu_nhiem_id = ?`,
      [req.user.id]
    );

    if (clubs.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy CLB' });
    }

    const [requests] = await db.query(
      `SELECT tv.*, sv.ho_ten, sv.ma_sinh_vien, sv.lop, sv.khoa, sv.anh_dai_dien
       FROM thanh_vien_clb tv
       JOIN sinh_vien sv ON tv.sinh_vien_id = sv.id
       WHERE tv.cau_lac_bo_id = ? AND tv.trang_thai = 'cho_duyet'
       ORDER BY tv.ngay_tham_gia DESC`,
      [clubs[0].id]
    );

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách', error: error.message });
  }
});

// Phê duyệt thành viên CLB
router.post('/approve-member/:id', async (req, res) => {
  try {
    const { id } = req.params; // ThanhVienCLB id

    await db.query(
      'UPDATE thanh_vien_clb SET trang_thai = "da_duyet", ngay_duyet = NOW() WHERE id = ?',
      [id]
    );

    // Gửi thông báo
    const [info] = await db.query(
      `SELECT sv.nguoi_dung_id, sv.ho_ten, clb.ten_clb
       FROM thanh_vien_clb tv
       JOIN sinh_vien sv ON tv.sinh_vien_id = sv.id
       JOIN cau_lac_bo clb ON tv.cau_lac_bo_id = clb.id
       WHERE tv.id = ?`,
      [id]
    );

    if (info.length > 0) {
      const { nguoi_dung_id, ten_clb } = info[0];

      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
         VALUES (?, 'duyet_thanh_vien_clb', 'Được duyệt tham gia CLB', ?)`,
        [nguoi_dung_id, `Chúc mừng! Bạn đã được duyệt tham gia ${ten_clb}`]
      );

      // Real-time
      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      const socketId = userSockets.get(nguoi_dung_id);
      
      if (socketId) {
        io.to(socketId).emit('notification', {
          type: 'duyet_thanh_vien_clb',
          message: `Bạn đã được duyệt tham gia ${ten_clb}`
        });
      }
    }

    res.json({ message: 'Phê duyệt thành viên thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi phê duyệt', error: error.message });
  }
});

// Từ chối thành viên CLB
router.post('/reject-member/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      'UPDATE thanh_vien_clb SET trang_thai = "tu_choi" WHERE id = ?',
      [id]
    );

    // Gửi thông báo
    const [info] = await db.query(
      `SELECT sv.nguoi_dung_id, clb.ten_clb
       FROM thanh_vien_clb tv
       JOIN sinh_vien sv ON tv.sinh_vien_id = sv.id
       JOIN cau_lac_bo clb ON tv.cau_lac_bo_id = clb.id
       WHERE tv.id = ?`,
      [id]
    );

    if (info.length > 0) {
      const { nguoi_dung_id, ten_clb } = info[0];

      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
         VALUES (?, 'tu_choi_thanh_vien_clb', 'Yêu cầu tham gia CLB không được duyệt', ?)`,
        [nguoi_dung_id, `Yêu cầu tham gia ${ten_clb} của bạn không được chấp nhận`]
      );
    }

    res.json({ message: 'Từ chối thành viên' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi từ chối', error: error.message });
  }
});

// Lấy danh sách thành viên của CLB
router.get('/members', async (req, res) => {
  try {
    const [clubs] = await db.query(
      `SELECT id FROM cau_lac_bo 
       WHERE chu_nhiem_id = ?`,
      [req.user.id]
    );

    if (clubs.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy CLB' });
    }

    const [members] = await db.query(
      `SELECT tv.*, sv.ho_ten, sv.ma_sinh_vien, sv.lop, sv.khoa, sv.anh_dai_dien
       FROM thanh_vien_clb tv
       JOIN sinh_vien sv ON tv.sinh_vien_id = sv.id
       WHERE tv.cau_lac_bo_id = ? AND tv.trang_thai = 'da_duyet'
       ORDER BY tv.ngay_duyet DESC`,
      [clubs[0].id]
    );

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách thành viên', error: error.message });
  }
});

// Loại bỏ thành viên khỏi CLB
router.delete('/remove-member/:id', async (req, res) => {
  try {
    const { id } = req.params; // ThanhVienCLB id

    await db.query('DELETE FROM thanh_vien_clb WHERE id = ?', [id]);

    res.json({ message: 'Loại bỏ thành viên thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi loại bỏ thành viên', error: error.message });
  }
});

// Cập nhật hoạt động
router.put('/activity/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      ten_hoat_dong, 
      mo_ta, 
      thoi_gian_bat_dau, 
      thoi_gian_ket_thuc, 
      dia_diem, 
      quy_dinh_trang_phuc, 
      so_luong_toi_da,
      trang_thai
    } = req.body;

    await db.query(
      `UPDATE hoat_dong SET 
       ten_hoat_dong = ?, mo_ta = ?, thoi_gian_bat_dau = ?, thoi_gian_ket_thuc = ?,
       dia_diem = ?, quy_dinh_trang_phuc = ?, so_luong_toi_da = ?, trang_thai = ?
       WHERE id = ?`,
      [ten_hoat_dong, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, 
       dia_diem, quy_dinh_trang_phuc, so_luong_toi_da, trang_thai, id]
    );

    res.json({ message: 'Cập nhật hoạt động thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật hoạt động', error: error.message });
  }
});

// Xóa hoạt động
// Xóa hoạt động
router.delete('/activity/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Kiểm tra quyền sở hữu
    const [activities] = await db.query(
      `SELECT hd.* FROM hoat_dong hd
       JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
       WHERE hd.id = ? AND clb.chu_nhiem_id = ?`,
      [id, userId]
    );

    if (activities.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa hoạt động này' });
    }

    // Xóa các bản ghi liên quan trước
    await db.query('DELETE FROM dang_ky_hoat_dong WHERE hoat_dong_id = ?', [id]);
    await db.query('DELETE FROM thong_bao WHERE lien_ket LIKE ?', [`%/hoat-dong/${id}%`]);
    
    // Xóa hoạt động
    await db.query('DELETE FROM hoat_dong WHERE id = ?', [id]);

    res.json({ message: 'Xóa hoạt động thành công' });
  } catch (error) {
    console.error('Lỗi xóa hoạt động:', error);
    res.status(500).json({ message: 'Lỗi xóa hoạt động', error: error.message });
  }
});

module.exports = router;
