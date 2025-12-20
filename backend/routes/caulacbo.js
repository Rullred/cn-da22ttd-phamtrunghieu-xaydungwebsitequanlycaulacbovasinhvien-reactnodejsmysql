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
      so_luong_toi_da,
      muc_dich,
      diem_ren_luyen
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
        dia_diem, quy_dinh_trang_phuc, so_luong_toi_da, muc_dich, diem_ren_luyen, trang_thai, trang_thai_duyet
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sap_dien_ra', 'cho_duyet')`,
      [cau_lac_bo_id, ten_hoat_dong, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, 
       dia_diem, quy_dinh_trang_phuc, so_luong_toi_da || 0, muc_dich || null, diem_ren_luyen || 0]
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
       WHERE cau_lac_bo_id = ? AND trang_thai != 'huy'
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
    console.log('=== APPROVE START ===', 'id:', id);

    // Lấy thông tin đăng ký
    const [regInfo] = await db.query(
      'SELECT hoat_dong_id, trang_thai FROM dang_ky_hoat_dong WHERE id = ?',
      [id]
    );
    console.log('RegInfo:', regInfo);

    if (regInfo.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký' });
    }

    const { hoat_dong_id, trang_thai } = regInfo[0];
    console.log('Trạng thái hiện tại:', trang_thai);

    // Cập nhật trạng thái sang 'dang_tham_gia' (đã duyệt lần 1)
    await db.query(
      'UPDATE dang_ky_hoat_dong SET trang_thai = "dang_tham_gia", ngay_duyet_lan_1 = NOW() WHERE id = ?',
      [id]
    );
    console.log('Đã update trạng thái sang dang_tham_gia');

    // Recalculate count để đảm bảo đúng
    await db.query(
      `UPDATE hoat_dong 
       SET so_luong_da_dang_ky = (
         SELECT COUNT(*) FROM dang_ky_hoat_dong 
         WHERE hoat_dong_id = ? 
         AND trang_thai IN ('cho_duyet', 'dang_tham_gia', 'hoan_thanh', 'da_duyet')
       ) 
       WHERE id = ?`,
      [hoat_dong_id, hoat_dong_id]
    );
    console.log('Đã recalculate count');

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
    console.log('1. Bắt đầu từ chối, id:', id, 'ly_do:', ly_do);

    // Lấy thông tin đăng ký
    const [regInfo] = await db.query(
      'SELECT hoat_dong_id, trang_thai FROM dang_ky_hoat_dong WHERE id = ?',
      [id]
    );
    console.log('2. Lấy thông tin đăng ký:', regInfo);

    if (regInfo.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký' });
    }

    const { hoat_dong_id, trang_thai } = regInfo[0];
    console.log('3. hoat_dong_id:', hoat_dong_id, 'trang_thai:', trang_thai);

    await db.query(
      'UPDATE dang_ky_hoat_dong SET trang_thai = "tu_choi", ly_do_tu_choi = ?, ngay_duyet = NOW() WHERE id = ?',
      [ly_do, id]
    );
    console.log('4. Đã update trạng thái từ chối');

    // Recalculate count để đảm bảo đúng
    await db.query(
      `UPDATE hoat_dong 
       SET so_luong_da_dang_ky = (
         SELECT COUNT(*) FROM dang_ky_hoat_dong 
         WHERE hoat_dong_id = ? 
         AND trang_thai IN ('cho_duyet', 'dang_tham_gia', 'hoan_thanh', 'da_duyet')
       ) 
       WHERE id = ?`,
      [hoat_dong_id, hoat_dong_id]
    );
    console.log('5. Đã recalculate count');

    // Lấy thông tin để gửi thông báo
    const [info] = await db.query(
      `SELECT sv.nguoi_dung_id, hd.ten_hoat_dong
       FROM dang_ky_hoat_dong dk
       JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       WHERE dk.id = ?`,
      [id]
    );
    console.log('6. Lấy info để gửi thông báo:', info);

    if (info.length > 0) {
      const { nguoi_dung_id, ten_hoat_dong } = info[0];
      console.log('7. Chuẩn bị gửi thông báo cho:', nguoi_dung_id);

      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
         VALUES (?, 'tu_choi_hoat_dong', 'Đăng ký hoạt động không được duyệt', ?)`,
        [nguoi_dung_id, `Đăng ký tham gia "${ten_hoat_dong}" không được duyệt. Lý do: ${ly_do || 'Không rõ'}`]
      );
      console.log('8. Đã insert thông báo');
    }

    console.log('9. Chuẩn bị trả về response');
    res.json({ message: 'Từ chối thành công' });
  } catch (error) {
    console.error('REJECT ERROR:', error);
    res.status(500).json({ message: 'Lỗi từ chối', error: error.message });
  }
});

// Xác nhận hoàn thành hoạt động (Lần 2 - Xác nhận đã tham gia)
router.post('/confirm-completion/:id', async (req, res) => {
  try {
    const { id } = req.params; // DangKyHoatDong id

    // Lấy thông tin đăng ký và điểm rèn luyện
    const [regInfo] = await db.query(
      `SELECT dk.hoat_dong_id, dk.trang_thai, dk.sinh_vien_id,
              sv.id as sv_id, sv.nguoi_dung_id, hd.ten_hoat_dong, hd.diem_ren_luyen
       FROM dang_ky_hoat_dong dk
       JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       WHERE dk.id = ?`,
      [id]
    );

    if (regInfo.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký' });
    }

    const { trang_thai, sv_id, nguoi_dung_id, ten_hoat_dong, diem_ren_luyen } = regInfo[0];
    const diemCong = diem_ren_luyen || 0;

    // Chỉ cho phép xác nhận nếu đã được duyệt lần 1
    if (trang_thai !== 'dang_tham_gia') {
      return res.status(400).json({ message: 'Sinh viên chưa được duyệt tham gia hoạt động' });
    }

    // Cập nhật trạng thái sang 'hoan_thanh' (đã duyệt lần 2)
    await db.query(
      'UPDATE dang_ky_hoat_dong SET trang_thai = "hoan_thanh", ngay_duyet_lan_2 = NOW() WHERE id = ?',
      [id]
    );

    // Cộng điểm rèn luyện cho sinh viên
    if (diemCong > 0) {
      await db.query(
        `UPDATE sinh_vien SET tong_diem_ren_luyen = tong_diem_ren_luyen + ? WHERE id = ?`,
        [diemCong, sv_id]
      );
    }

    // Gửi thông báo
    await db.query(
      `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
       VALUES (?, 'duyet_hoat_dong', 'Hoàn thành hoạt động', ?)`,
      [nguoi_dung_id, `Bạn đã hoàn thành hoạt động "${ten_hoat_dong}". +${diemCong} điểm rèn luyện!`]
    );

    // Real-time notification
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const socketId = userSockets.get(nguoi_dung_id);
    
    if (socketId) {
      io.to(socketId).emit('notification', {
        type: 'duyet_hoat_dong',
        message: `Bạn đã hoàn thành hoạt động "${ten_hoat_dong}". +${diemCong} điểm!`
      });
    }

    res.json({ message: 'Xác nhận hoàn thành thành công', diem_cong: diemCong });
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

// Hủy hoạt động (thay vì xóa hoàn toàn)
router.delete('/activity/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Kiểm tra quyền sở hữu và lấy thông tin hoạt động
    const [activities] = await db.query(
      `SELECT hd.*, clb.ten_clb FROM hoat_dong hd
       JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
       WHERE hd.id = ? AND clb.chu_nhiem_id = ?`,
      [id, userId]
    );

    if (activities.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền hủy hoạt động này' });
    }

    const hoatDong = activities[0];

    // Lấy danh sách sinh viên đã đăng ký hoạt động này
    const [registeredStudents] = await db.query(
      `SELECT sv.nguoi_dung_id, sv.ho_ten
       FROM dang_ky_hoat_dong dk
       JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
       WHERE dk.hoat_dong_id = ? AND dk.trang_thai IN ('cho_duyet', 'da_duyet', 'dang_tham_gia')`,
      [id]
    );

    // Cập nhật trạng thái hoạt động thành "huy" thay vì xóa
    await db.query(
      'UPDATE hoat_dong SET trang_thai = "huy", so_luong_da_dang_ky = 0 WHERE id = ?',
      [id]
    );

    // Cập nhật trạng thái đăng ký của sinh viên thành "da_huy"
    await db.query(
      'UPDATE dang_ky_hoat_dong SET trang_thai = "da_huy" WHERE hoat_dong_id = ?',
      [id]
    );

    // Gửi thông báo cho tất cả sinh viên đã đăng ký
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');

    for (const student of registeredStudents) {
      // Tạo thông báo trong database
      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
         VALUES (?, 'nho_hoat_dong', 'Hoạt động đã bị hủy', ?, ?)`,
        [
          student.nguoi_dung_id, 
          `Hoạt động "${hoatDong.ten_hoat_dong}" của ${hoatDong.ten_clb} đã bị hủy. Chúng tôi rất tiếc về sự bất tiện này.`,
          `/sinhvien/cua-toi`
        ]
      );

      // Gửi thông báo real-time nếu sinh viên đang online
      const socketId = userSockets?.get(student.nguoi_dung_id);
      if (socketId) {
        io.to(socketId).emit('notification', {
          type: 'huy_hoat_dong',
          message: `Hoạt động "${hoatDong.ten_hoat_dong}" đã bị hủy`
        });
      }
    }

    res.json({ 
      message: 'Hủy hoạt động thành công',
      notified_students: registeredStudents.length
    });
  } catch (error) {
    console.error('Lỗi hủy hoạt động:', error);
    res.status(500).json({ message: 'Lỗi hủy hoạt động', error: error.message });
  }
});

// ==================== THỐNG KÊ CLB ====================

// Lấy thống kê chi tiết cho CLB
router.get('/statistics', async (req, res) => {
  try {
    // Lấy CLB của Chủ nhiệm
    const [clubs] = await db.query(
      `SELECT id, ten_clb FROM cau_lac_bo WHERE chu_nhiem_id = ?`,
      [req.user.id]
    );

    if (clubs.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy CLB' });
    }

    const clb_id = clubs[0].id;

    // Tổng thành viên
    const [memberCount] = await db.query(
      `SELECT COUNT(*) as total FROM thanh_vien_clb WHERE cau_lac_bo_id = ? AND trang_thai = 'da_duyet'`,
      [clb_id]
    );

    // Tổng hoạt động đã tổ chức
    const [activityCount] = await db.query(
      `SELECT COUNT(*) as total FROM hoat_dong WHERE cau_lac_bo_id = ? AND trang_thai_duyet = 'da_duyet'`,
      [clb_id]
    );

    // Tổng lượt tham gia (hoàn thành)
    const [participationCount] = await db.query(
      `SELECT COUNT(*) as total FROM dang_ky_hoat_dong dk
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       WHERE hd.cau_lac_bo_id = ? AND dk.trang_thai = 'hoan_thanh'`,
      [clb_id]
    );

    // Tổng đăng ký
    const [totalRegistrations] = await db.query(
      `SELECT COUNT(*) as total FROM dang_ky_hoat_dong dk
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       WHERE hd.cau_lac_bo_id = ? AND dk.trang_thai IN ('cho_duyet', 'dang_tham_gia', 'hoan_thanh')`,
      [clb_id]
    );

    // Tỷ lệ hoàn thành
    const tyLeHoanThanh = totalRegistrations[0].total > 0
      ? Math.round((participationCount[0].total / totalRegistrations[0].total) * 100)
      : 0;

    // Thống kê hoạt động theo tháng (6 tháng gần nhất)
    const [hoatDongTheoThang] = await db.query(`
      SELECT 
        DATE_FORMAT(thoi_gian_bat_dau, '%Y-%m') as thang,
        COUNT(*) as so_hoat_dong
      FROM hoat_dong
      WHERE cau_lac_bo_id = ? 
        AND thoi_gian_bat_dau >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND trang_thai_duyet = 'da_duyet'
      GROUP BY DATE_FORMAT(thoi_gian_bat_dau, '%Y-%m')
      ORDER BY thang ASC
    `, [clb_id]);

    // Thống kê thành viên theo khoa
    const [thanhVienTheoKhoa] = await db.query(`
      SELECT 
        sv.khoa,
        COUNT(*) as so_luong
      FROM thanh_vien_clb tv
      JOIN sinh_vien sv ON tv.sinh_vien_id = sv.id
      WHERE tv.cau_lac_bo_id = ? AND tv.trang_thai = 'da_duyet' AND sv.khoa IS NOT NULL
      GROUP BY sv.khoa
      ORDER BY so_luong DESC
      LIMIT 10
    `, [clb_id]);

    // Hoạt động gần đây
    const [hoatDongGanDay] = await db.query(`
      SELECT 
        hd.id,
        hd.ten_hoat_dong,
        hd.thoi_gian_bat_dau,
        hd.trang_thai,
        hd.trang_thai_duyet,
        (SELECT COUNT(*) FROM dang_ky_hoat_dong WHERE hoat_dong_id = hd.id AND trang_thai IN ('dang_tham_gia', 'hoan_thanh')) as so_tham_gia
      FROM hoat_dong hd
      WHERE hd.cau_lac_bo_id = ?
      ORDER BY hd.thoi_gian_bat_dau DESC
      LIMIT 5
    `, [clb_id]);

    // Top sinh viên tích cực trong CLB
    const [topSinhVien] = await db.query(`
      SELECT 
        sv.ho_ten,
        sv.ma_sinh_vien,
        sv.lop,
        COUNT(dk.id) as so_hoat_dong
      FROM sinh_vien sv
      JOIN dang_ky_hoat_dong dk ON sv.id = dk.sinh_vien_id
      JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
      WHERE hd.cau_lac_bo_id = ? AND dk.trang_thai = 'hoan_thanh'
      GROUP BY sv.id, sv.ho_ten, sv.ma_sinh_vien, sv.lop
      ORDER BY so_hoat_dong DESC
      LIMIT 5
    `, [clb_id]);

    res.json({
      ten_clb: clubs[0].ten_clb,
      tong_quan: {
        tong_thanh_vien: memberCount[0].total,
        tong_hoat_dong: activityCount[0].total,
        luot_tham_gia: participationCount[0].total,
        ty_le_hoan_thanh: tyLeHoanThanh
      },
      hoat_dong_theo_thang: hoatDongTheoThang,
      thanh_vien_theo_khoa: thanhVienTheoKhoa,
      hoat_dong_gan_day: hoatDongGanDay,
      top_sinh_vien: topSinhVien
    });
  } catch (error) {
    console.error('Lỗi lấy thống kê CLB:', error);
    res.status(500).json({ message: 'Lỗi lấy thống kê', error: error.message });
  }
});

// API lấy top sinh viên theo điểm rèn luyện (cho CLB)
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

module.exports = router;
