const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, isApproved } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Tất cả routes yêu cầu đăng nhập và tài khoản đã được duyệt
router.use(authenticateToken);
router.use(isApproved);

// Lấy danh sách tất cả hoạt động (cho sinh viên)
router.get('/activities', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Lấy sinh_vien_id
    const [sinhvien] = await db.query(
      'SELECT id FROM sinh_vien WHERE nguoi_dung_id = ?',
      [userId]
    );

    if (sinhvien.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin sinh viên' });
    }

    const sinhvienId = sinhvien[0].id;

    // Lấy danh sách hoạt động kèm thông tin đăng ký (bao gồm cả hoạt động Admin)
    const [activities] = await db.query(
      `SELECT hd.*, 
              COALESCE(clb.ten_clb, hd.don_vi_phu_trach) as ten_clb, 
              clb.id as clb_id,
              dk.id as dang_ky_id,
              dk.trang_thai as trang_thai_dang_ky,
              IF(dk.id IS NOT NULL, 1, 0) as da_dang_ky
       FROM hoat_dong hd
       LEFT JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
       LEFT JOIN dang_ky_hoat_dong dk ON hd.id = dk.hoat_dong_id AND dk.sinh_vien_id = ?
       WHERE hd.trang_thai IN ('sap_dien_ra', 'dang_dien_ra')
       AND hd.trang_thai_duyet = 'da_duyet'
       ORDER BY hd.thoi_gian_bat_dau ASC`,
      [sinhvienId]
    );

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách hoạt động', error: error.message });
  }
});

// Lấy chi tiết một hoạt động
router.get('/activity/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [activities] = await db.query(
      `SELECT hd.*, 
              COALESCE(clb.ten_clb, hd.don_vi_phu_trach) as ten_clb, 
              clb.mo_ta as clb_mo_ta
       FROM hoat_dong hd
       LEFT JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
       WHERE hd.id = ?`,
      [id]
    );

    if (activities.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hoạt động' });
    }

    res.json(activities[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết hoạt động', error: error.message });
  }
});

// Đăng ký tham gia hoạt động
router.post('/register-activity/:id', async (req, res) => {
  try {
    const { id } = req.params; // hoat_dong_id
    const { ghi_chu } = req.body;
    console.log('=== REGISTER START ===', 'hoat_dong_id:', id);

    // Lấy thông tin sinh viên
    const [sinhvien] = await db.query(
      'SELECT id FROM sinh_vien WHERE nguoi_dung_id = ?',
      [req.user.id]
    );

    if (sinhvien.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }

    const sinh_vien_id = sinhvien[0].id;
    console.log('sinh_vien_id:', sinh_vien_id);

    // Kiểm tra đã đăng ký chưa
    const [existing] = await db.query(
      'SELECT * FROM dang_ky_hoat_dong WHERE hoat_dong_id = ? AND sinh_vien_id = ?',
      [id, sinh_vien_id]
    );
    console.log('Existing registrations:', existing.length);

    if (existing.length > 0) {
      const currentStatus = existing[0].trang_thai;
      console.log('Current status:', currentStatus);
      
      // Nếu đã bị từ chối hoặc đã hủy, cho phép đăng ký lại
      if (currentStatus === 'tu_choi' || currentStatus === 'da_huy') {
        console.log('Đăng ký lại - Tăng count');
        
        // Kiểm tra xem có phải hoạt động Admin không
        const [hdInfo] = await db.query('SELECT is_admin_activity FROM hoat_dong WHERE id = ?', [id]);
        const isAdminActivity = hdInfo.length > 0 && hdInfo[0].is_admin_activity;
        const newStatus = isAdminActivity ? 'dang_tham_gia' : 'cho_duyet';
        
        await db.query(
          `UPDATE dang_ky_hoat_dong 
           SET trang_thai = ?, ghi_chu = ?, ngay_dang_ky = NOW(), ngay_duyet_lan_1 = ${isAdminActivity ? 'NOW()' : 'NULL'}, ly_do_tu_choi = NULL
           WHERE id = ?`,
          [newStatus, ghi_chu, existing[0].id]
        );
        
        // Recalculate count
        await db.query(
          `UPDATE hoat_dong 
           SET so_luong_da_dang_ky = (
             SELECT COUNT(*) FROM dang_ky_hoat_dong 
             WHERE hoat_dong_id = ? 
             AND trang_thai IN ('cho_duyet', 'dang_tham_gia', 'hoan_thanh', 'da_duyet')
           ) 
           WHERE id = ?`,
          [id, id]
        );
        
        const message = isAdminActivity 
          ? 'Đăng ký thành công! Bạn đã được tự động xác nhận tham gia.'
          : 'Đăng ký lại thành công! Vui lòng chờ CLB phê duyệt.';
        return res.json({ message });
      }
      
      console.log('Đã đăng ký rồi - Không cho phép');
      return res.status(400).json({ message: 'Bạn đã đăng ký hoạt động này rồi' });
    }

    console.log('Đăng ký mới - Tăng count');

    // Kiểm tra số lượng
    const [hoatdong] = await db.query(
      'SELECT so_luong_toi_da, so_luong_da_dang_ky, is_admin_activity, don_vi_phu_trach, ten_hoat_dong FROM hoat_dong WHERE id = ?',
      [id]
    );

    if (hoatdong.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hoạt động' });
    }

    const { so_luong_toi_da, so_luong_da_dang_ky, is_admin_activity, don_vi_phu_trach, ten_hoat_dong } = hoatdong[0];
    if (so_luong_toi_da > 0 && so_luong_da_dang_ky >= so_luong_toi_da) {
      return res.status(400).json({ message: 'Hoạt động đã đủ số lượng người đăng ký' });
    }

    // Xác định trạng thái đăng ký
    // Nếu là hoạt động Admin tạo -> tự động duyệt lần 1 (dang_tham_gia)
    // Nếu là hoạt động CLB -> chờ duyệt (cho_duyet)
    const trangThaiDangKy = is_admin_activity ? 'dang_tham_gia' : 'cho_duyet';
    const ngayDuyetLan1 = is_admin_activity ? 'NOW()' : 'NULL';

    // Đăng ký
    await db.query(
      `INSERT INTO dang_ky_hoat_dong (hoat_dong_id, sinh_vien_id, ghi_chu, trang_thai, ngay_duyet_lan_1)
       VALUES (?, ?, ?, ?, ${ngayDuyetLan1})`,
      [id, sinh_vien_id, ghi_chu, trangThaiDangKy]
    );

    // Recalculate count
    await db.query(
      `UPDATE hoat_dong 
       SET so_luong_da_dang_ky = (
         SELECT COUNT(*) FROM dang_ky_hoat_dong 
         WHERE hoat_dong_id = ? 
         AND trang_thai IN ('cho_duyet', 'dang_tham_gia', 'hoan_thanh', 'da_duyet')
       ) 
       WHERE id = ?`,
      [id, id]
    );

    // Gửi thông báo
    if (is_admin_activity) {
      // Hoạt động Admin - thông báo đăng ký thành công và tự động xác nhận
      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
         VALUES (?, 'dang_ky_thanh_cong', 'Đăng ký hoạt động thành công', ?, ?)`,
        [req.user.id, `Bạn đã đăng ký tham gia hoạt động "${ten_hoat_dong}" từ ${don_vi_phu_trach}. Đăng ký của bạn đã được tự động xác nhận!`, `/sinhvien/hoat-dong-cua-toi`]
      );
      
      res.json({ message: 'Đăng ký thành công! Bạn đã được tự động xác nhận tham gia hoạt động.' });
    } else {
      // Hoạt động CLB - cần chờ duyệt
      const [clbInfo] = await db.query(
        `SELECT clb.chu_nhiem_id, sv.ho_ten, hd.ten_hoat_dong
         FROM hoat_dong hd
         JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
         JOIN sinh_vien sv ON sv.id = ?
         WHERE hd.id = ?`,
        [sinh_vien_id, id]
      );

      if (clbInfo.length > 0) {
        const { chu_nhiem_id, ho_ten, ten_hoat_dong: tenHD } = clbInfo[0];

        // Thông báo cho SINH VIÊN
        await db.query(
          `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
           VALUES (?, 'dang_ky_thanh_cong', 'Đăng ký hoạt động thành công', ?, ?)`,
          [req.user.id, `Bạn đã đăng ký tham gia hoạt động "${tenHD}" thành công. Vui lòng chờ chủ nhiệm CLB phê duyệt.`, `/sinhvien/hoat-dong/${id}`]
        );

        // Thông báo cho CHỦ NHIỆM CLB
        if (chu_nhiem_id) {
          await db.query(
            `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
             VALUES (?, 'dang_ky_thanh_cong', 'Có sinh viên đăng ký hoạt động', ?, ?)`,
            [chu_nhiem_id, `${ho_ten} vừa đăng ký tham gia hoạt động "${tenHD}". Vui lòng phê duyệt.`, `/caulacbo/hoat-dong`]
          );
        }
      }

      res.json({ message: 'Đăng ký hoạt động thành công! Vui lòng chờ CLB phê duyệt.' });
    }
  } catch (error) {
    console.error('Lỗi đăng ký hoạt động:', error);
    res.status(500).json({ message: 'Lỗi đăng ký hoạt động', error: error.message });
  }
});

// Hủy đăng ký hoạt động
router.delete('/cancel-registration/:id', async (req, res) => {
  try {
    const { id } = req.params; // hoat_dong_id

    const [sinhvien] = await db.query(
      'SELECT id FROM sinh_vien WHERE nguoi_dung_id = ?',
      [req.user.id]
    );

    if (sinhvien.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }

    // Cập nhật trạng thái đăng ký
    await db.query(
      'UPDATE dang_ky_hoat_dong SET trang_thai = "da_huy" WHERE hoat_dong_id = ? AND sinh_vien_id = ?',
      [id, sinhvien[0].id]
    );

    // Recalculate count
    await db.query(
      `UPDATE hoat_dong 
       SET so_luong_da_dang_ky = (
         SELECT COUNT(*) FROM dang_ky_hoat_dong 
         WHERE hoat_dong_id = ? 
         AND trang_thai IN ('cho_duyet', 'dang_tham_gia', 'hoan_thanh', 'da_duyet')
       ) 
       WHERE id = ?`,
      [id, id]
    );

    res.json({ message: 'Hủy đăng ký thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hủy đăng ký', error: error.message });
  }
});

// Lấy danh sách hoạt động đã đăng ký
router.get('/my-activities', async (req, res) => {
  try {
    const [sinhvien] = await db.query(
      'SELECT id FROM sinh_vien WHERE nguoi_dung_id = ?',
      [req.user.id]
    );

    if (sinhvien.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }

    const [activities] = await db.query(
      `SELECT hd.*, 
              COALESCE(clb.ten_clb, hd.don_vi_phu_trach) as ten_clb, 
              dk.id as dang_ky_id,
              dk.trang_thai as trang_thai_dang_ky, 
              dk.ngay_dang_ky,
              dk.ghi_chu,
              dk.ly_do_tu_choi,
              hd.id as hoat_dong_id
       FROM dang_ky_hoat_dong dk
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       LEFT JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
       WHERE dk.sinh_vien_id = ?
       ORDER BY dk.ngay_dang_ky DESC`,
      [sinhvien[0].id]
    );

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách', error: error.message });
  }
});

// Xin tham gia câu lạc bộ
router.post('/join-club/:clb_id', async (req, res) => {
  try {
    const { clb_id } = req.params;

    const [sinhvien] = await db.query(
      'SELECT id FROM sinh_vien WHERE nguoi_dung_id = ?',
      [req.user.id]
    );

    if (sinhvien.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }

    const sinh_vien_id = sinhvien[0].id;

    // Kiểm tra đã là thành viên chưa
    const [existing] = await db.query(
      'SELECT * FROM thanh_vien_clb WHERE cau_lac_bo_id = ? AND sinh_vien_id = ?',
      [clb_id, sinh_vien_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Bạn đã gửi yêu cầu hoặc đã là thành viên CLB' });
    }

    // Thêm yêu cầu
    await db.query(
      `INSERT INTO thanh_vien_clb (cau_lac_bo_id, sinh_vien_id, trang_thai)
       VALUES (?, ?, 'cho_duyet')`,
      [clb_id, sinh_vien_id]
    );

    // Gửi thông báo cho Chủ nhiệm
    const [clbInfo] = await db.query(
      `SELECT chu_nhiem_id, ten_clb FROM cau_lac_bo WHERE id = ?`,
      [clb_id]
    );

    if (clbInfo.length > 0) {
      const { chu_nhiem_id, ten_clb } = clbInfo[0];
      const [svInfo] = await db.query('SELECT ho_ten FROM sinh_vien WHERE id = ?', [sinh_vien_id]);

      if (chu_nhiem_id && svInfo.length > 0) {
        await db.query(
          `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung)
           VALUES (?, 'duyet_thanh_vien_clb', 'Yêu cầu tham gia CLB', ?)`,
          [chu_nhiem_id, `${svInfo[0].ho_ten} muốn tham gia ${ten_clb}`]
        );
      }
    }

    res.json({ message: 'Gửi yêu cầu tham gia CLB thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi yêu cầu', error: error.message });
  }
});

// Lấy danh sách tất cả CLB (kèm trạng thái thành viên của sinh viên)
router.get('/clubs', async (req, res) => {
  try {
    // Lấy thông tin sinh viên
    const [sinhvien] = await db.query(
      'SELECT id FROM sinh_vien WHERE nguoi_dung_id = ?',
      [req.user.id]
    );

    const sinh_vien_id = sinhvien.length > 0 ? sinhvien[0].id : null;

    // Lấy danh sách CLB kèm thông tin thành viên
    const [clubs] = await db.query(
      `SELECT 
        clb.id,
        clb.ten_clb,
        clb.mo_ta,
        clb.logo,
        clb.ngay_thanh_lap,
        clb.trang_thai,
        sv_cn.ho_ten as chu_nhiem_name,
        (SELECT COUNT(*) FROM thanh_vien_clb tv WHERE tv.cau_lac_bo_id = clb.id AND tv.trang_thai = 'da_duyet') as so_thanh_vien,
        tv_sv.trang_thai as membership_status
       FROM cau_lac_bo clb
       LEFT JOIN nguoi_dung nd ON clb.chu_nhiem_id = nd.id
       LEFT JOIN sinh_vien sv_cn ON nd.id = sv_cn.nguoi_dung_id
       LEFT JOIN thanh_vien_clb tv_sv ON clb.id = tv_sv.cau_lac_bo_id AND tv_sv.sinh_vien_id = ?
       WHERE clb.trang_thai = 'hoat_dong'
       ORDER BY clb.ten_clb ASC`,
      [sinh_vien_id]
    );

    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách CLB', error: error.message });
  }
});

// Cập nhật hồ sơ
router.put('/profile', async (req, res) => {
  try {
    const { ho_ten, lop, khoa, khoa_hoc } = req.body;

    const [sinhvien] = await db.query(
      'SELECT id FROM sinh_vien WHERE nguoi_dung_id = ?',
      [req.user.id]
    );

    if (sinhvien.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }

    await db.query(
      'UPDATE sinh_vien SET ho_ten = ?, lop = ?, khoa = ?, khoa_hoc = ? WHERE id = ?',
      [ho_ten, lop, khoa, khoa_hoc || null, sinhvien[0].id]
    );

    res.json({ message: 'Cập nhật hồ sơ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật hồ sơ', error: error.message });
  }
});

module.exports = router;
