const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, isAdmin, isChuNhiemCLB } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer cho upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    if (file.fieldname === 'file_excel') {
      uploadPath = 'uploads/excel/';
    } else if (file.fieldname === 'file_pdf') {
      uploadPath = 'uploads/pdf/';
    }
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'file_excel') {
      const allowedTypes = ['.xlsx', '.xls', '.csv'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls, .csv)'));
      }
    } else if (file.fieldname === 'file_pdf') {
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext === '.pdf') {
        cb(null, true);
      } else {
        cb(new Error('Chỉ chấp nhận file PDF'));
      }
    } else {
      cb(null, true);
    }
  }
});

// ==================== API CHO CLB ====================

// CLB gửi yêu cầu làm danh sách (cách cũ - thủ công)
router.post('/clb/gui-yeu-cau', authenticateToken, isChuNhiemCLB, upload.single('file_excel'), async (req, res) => {
  try {
    const { ten_hoat_dong, ngay_to_chuc, mo_ta } = req.body;
    
    // Lấy CLB của chủ nhiệm
    const [clubs] = await db.query(
      'SELECT id, ten_clb FROM cau_lac_bo WHERE chu_nhiem_id = ?',
      [req.user.id]
    );

    if (clubs.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy CLB của bạn' });
    }

    const clb = clubs[0];
    const file_excel = req.file ? `/uploads/excel/${req.file.filename}` : null;

    // Tạo yêu cầu
    const [result] = await db.query(
      `INSERT INTO yeu_cau_danh_sach (cau_lac_bo_id, ten_hoat_dong, ngay_to_chuc, mo_ta, file_excel)
       VALUES (?, ?, ?, ?, ?)`,
      [clb.id, ten_hoat_dong, ngay_to_chuc, mo_ta, file_excel]
    );

    // Gửi thông báo cho Admin
    const [admins] = await db.query(
      'SELECT id FROM nguoi_dung WHERE loai_nguoi_dung = "admin"'
    );

    for (const admin of admins) {
      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
         VALUES (?, 'yeu_cau_danh_sach', 'Yêu cầu làm danh sách mới', ?, '/admin/danh-sach-hoat-dong')`,
        [admin.id, `${clb.ten_clb} gửi yêu cầu làm danh sách cho hoạt động "${ten_hoat_dong}"`]
      );
    }

    // Real-time notification
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    for (const admin of admins) {
      const socketId = userSockets?.get(admin.id);
      if (socketId) {
        io.to(socketId).emit('notification', {
          type: 'yeu_cau_danh_sach',
          message: `${clb.ten_clb} gửi yêu cầu làm danh sách`
        });
      }
    }

    res.json({ message: 'Gửi yêu cầu thành công', id: result.insertId });
  } catch (error) {
    console.error('Lỗi gửi yêu cầu:', error);
    res.status(500).json({ message: 'Lỗi gửi yêu cầu', error: error.message });
  }
});

// CLB gửi yêu cầu cung cấp minh chứng từ hoạt động đã hoàn thành
router.post('/clb/gui-yeu-cau-tu-hoat-dong/:hoat_dong_id', authenticateToken, isChuNhiemCLB, async (req, res) => {
  try {
    const { hoat_dong_id } = req.params;
    
    // Lấy CLB của chủ nhiệm
    const [clubs] = await db.query(
      'SELECT id, ten_clb FROM cau_lac_bo WHERE chu_nhiem_id = ?',
      [req.user.id]
    );

    if (clubs.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy CLB của bạn' });
    }

    // Lấy thông tin hoạt động và kiểm tra quyền
    const [activities] = await db.query(
      `SELECT hd.*, 
        (SELECT COUNT(*) FROM dang_ky_hoat_dong WHERE hoat_dong_id = hd.id AND trang_thai = 'hoan_thanh') as so_luong_hoan_thanh
       FROM hoat_dong hd 
       WHERE hd.id = ? AND hd.cau_lac_bo_id = ?`,
      [hoat_dong_id, clubs[0].id]
    );

    if (activities.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hoạt động hoặc bạn không có quyền' });
    }

    const activity = activities[0];

    if (activity.so_luong_hoan_thanh === 0) {
      return res.status(400).json({ message: 'Chưa có sinh viên nào hoàn thành hoạt động này' });
    }

    // Kiểm tra xem đã gửi yêu cầu cho hoạt động này chưa
    const [existing] = await db.query(
      `SELECT id FROM yeu_cau_danh_sach WHERE hoat_dong_id = ?`,
      [hoat_dong_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Đã gửi yêu cầu cho hoạt động này rồi' });
    }

    // Tạo yêu cầu mới
    const [result] = await db.query(
      `INSERT INTO yeu_cau_danh_sach (cau_lac_bo_id, hoat_dong_id, ten_hoat_dong, ngay_to_chuc, mo_ta)
       VALUES (?, ?, ?, ?, ?)`,
      [clubs[0].id, hoat_dong_id, activity.ten_hoat_dong, 
       activity.thoi_gian_bat_dau, `Hoạt động có ${activity.so_luong_hoan_thanh} sinh viên hoàn thành`]
    );

    // Gửi thông báo cho Admin
    const [admins] = await db.query(
      'SELECT id FROM nguoi_dung WHERE loai_nguoi_dung = "admin"'
    );

    for (const admin of admins) {
      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
         VALUES (?, 'yeu_cau_minh_chung', 'Yêu cầu cung cấp minh chứng', ?, '/admin/danh-sach-hoat-dong')`,
        [admin.id, `${clubs[0].ten_clb} yêu cầu cung cấp minh chứng cho hoạt động "${activity.ten_hoat_dong}"`]
      );
    }

    // Real-time notification
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    for (const admin of admins) {
      const socketId = userSockets?.get(admin.id);
      if (socketId) {
        io.to(socketId).emit('notification', {
          type: 'yeu_cau_minh_chung',
          message: `${clubs[0].ten_clb} yêu cầu cung cấp minh chứng`
        });
      }
    }

    res.json({ message: 'Gửi yêu cầu thành công', id: result.insertId });
  } catch (error) {
    console.error('Lỗi gửi yêu cầu:', error);
    res.status(500).json({ message: 'Lỗi gửi yêu cầu', error: error.message });
  }
});

// CLB xem danh sách yêu cầu đã gửi
router.get('/clb/yeu-cau', authenticateToken, isChuNhiemCLB, async (req, res) => {
  try {
    const [clubs] = await db.query(
      'SELECT id FROM cau_lac_bo WHERE chu_nhiem_id = ?',
      [req.user.id]
    );

    if (clubs.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy CLB' });
    }

    const [requests] = await db.query(
      `SELECT y.*, 
        (SELECT COUNT(*) FROM dang_ky_hoat_dong WHERE hoat_dong_id = y.hoat_dong_id AND trang_thai = 'hoan_thanh') as so_luong_hoan_thanh
       FROM yeu_cau_danh_sach y 
       WHERE y.cau_lac_bo_id = ? 
       ORDER BY y.created_at DESC`,
      [clubs[0].id]
    );

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách yêu cầu', error: error.message });
  }
});

// CLB xem danh sách file PDF (chỉ xem, không chỉnh sửa)
router.get('/clb/danh-sach-file', authenticateToken, isChuNhiemCLB, async (req, res) => {
  try {
    const [clubs] = await db.query(
      'SELECT id FROM cau_lac_bo WHERE chu_nhiem_id = ?',
      [req.user.id]
    );

    if (clubs.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy CLB' });
    }

    // Lấy file của CLB mình hoặc file chung (không có CLB cụ thể)
    const [files] = await db.query(
      `SELECT f.*, c.ten_clb 
       FROM danh_sach_hoat_dong_file f
       LEFT JOIN cau_lac_bo c ON f.cau_lac_bo_id = c.id
       WHERE f.cau_lac_bo_id = ? OR f.cau_lac_bo_id IS NULL
       ORDER BY f.created_at DESC`,
      [clubs[0].id]
    );

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách file', error: error.message });
  }
});

// ==================== API CHO ADMIN ====================

// Admin xem tất cả yêu cầu từ CLB
router.get('/admin/yeu-cau', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT y.*, c.ten_clb,
        (SELECT COUNT(*) FROM dang_ky_hoat_dong WHERE hoat_dong_id = y.hoat_dong_id AND trang_thai = 'hoan_thanh') as so_luong_hoan_thanh
       FROM yeu_cau_danh_sach y
       JOIN cau_lac_bo c ON y.cau_lac_bo_id = c.id
       ORDER BY y.created_at DESC`
    );

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách yêu cầu', error: error.message });
  }
});

// Admin cập nhật trạng thái yêu cầu
router.put('/admin/yeu-cau/:id/trang-thai', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;

    await db.query(
      'UPDATE yeu_cau_danh_sach SET trang_thai = ? WHERE id = ?',
      [trang_thai, id]
    );

    // Gửi thông báo cho CLB
    const [request] = await db.query(
      `SELECT y.*, c.chu_nhiem_id, c.ten_clb 
       FROM yeu_cau_danh_sach y
       JOIN cau_lac_bo c ON y.cau_lac_bo_id = c.id
       WHERE y.id = ?`,
      [id]
    );

    if (request.length > 0) {
      const statusText = trang_thai === 'dang_xu_ly' ? 'đang được xử lý' : 
                        trang_thai === 'hoan_thanh' ? 'đã hoàn thành' : 'chờ xử lý';
      
      await db.query(
        `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
         VALUES (?, 'cap_nhat_yeu_cau', 'Cập nhật yêu cầu danh sách', ?, '/caulacbo/danh-sach-hoat-dong')`,
        [request[0].chu_nhiem_id, `Yêu cầu làm danh sách "${request[0].ten_hoat_dong}" ${statusText}`]
      );
    }

    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái', error: error.message });
  }
});

// Admin tải danh sách sinh viên hoàn thành từ hoạt động
router.get('/admin/tai-danh-sach/:hoat_dong_id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { hoat_dong_id } = req.params;

    // Lấy danh sách sinh viên đã hoàn thành
    const [participants] = await db.query(
      `SELECT 
         sv.ho_ten, sv.ma_sinh_vien, sv.lop, sv.khoa, sv.khoa_hoc,
         dk.ngay_dang_ky, dk.ngay_duyet_lan_1, dk.ngay_duyet_lan_2,
         hd.ten_hoat_dong, hd.thoi_gian_bat_dau, hd.thoi_gian_ket_thuc, hd.dia_diem
       FROM dang_ky_hoat_dong dk
       JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
       JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
       WHERE dk.hoat_dong_id = ? AND dk.trang_thai = 'hoan_thanh'
       ORDER BY sv.ho_ten`,
      [hoat_dong_id]
    );

    if (participants.length === 0) {
      return res.status(404).json({ message: 'Không có sinh viên nào hoàn thành hoạt động này' });
    }

    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh sách', error: error.message });
  }
});

// Admin upload file PDF
router.post('/admin/upload-pdf', authenticateToken, isAdmin, upload.single('file_pdf'), async (req, res) => {
  try {
    const { ten_hoat_dong, muc_dich, cau_lac_bo_id, mo_ta, yeu_cau_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file PDF' });
    }

    const file_pdf = `/uploads/pdf/${req.file.filename}`;

    const [result] = await db.query(
      `INSERT INTO danh_sach_hoat_dong_file (yeu_cau_id, ten_hoat_dong, muc_dich, cau_lac_bo_id, file_pdf, mo_ta, admin_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [yeu_cau_id || null, ten_hoat_dong, muc_dich, cau_lac_bo_id || null, file_pdf, mo_ta, req.user.id]
    );

    // Nếu có yêu cầu liên quan, cập nhật trạng thái
    if (yeu_cau_id) {
      await db.query(
        'UPDATE yeu_cau_danh_sach SET trang_thai = "hoan_thanh" WHERE id = ?',
        [yeu_cau_id]
      );
    }

    // Gửi thông báo cho CLB nếu có
    if (cau_lac_bo_id) {
      const [club] = await db.query(
        'SELECT chu_nhiem_id FROM cau_lac_bo WHERE id = ?',
        [cau_lac_bo_id]
      );

      if (club.length > 0) {
        await db.query(
          `INSERT INTO thong_bao (nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, lien_ket)
           VALUES (?, 'danh_sach_moi', 'Danh sách hoạt động mới', ?, '/caulacbo/danh-sach-hoat-dong')`,
          [club[0].chu_nhiem_id, `Admin đã upload danh sách cho hoạt động "${ten_hoat_dong}"`]
        );
      }
    }

    res.json({ message: 'Upload file thành công', id: result.insertId });
  } catch (error) {
    console.error('Lỗi upload file:', error);
    res.status(500).json({ message: 'Lỗi upload file', error: error.message });
  }
});

// Admin xem tất cả file PDF đã upload
router.get('/admin/danh-sach-file', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [files] = await db.query(
      `SELECT f.*, c.ten_clb
       FROM danh_sach_hoat_dong_file f
       LEFT JOIN cau_lac_bo c ON f.cau_lac_bo_id = c.id
       ORDER BY f.created_at DESC`
    );

    res.json(files);
  } catch (error) {
    console.error('Lỗi lấy danh sách file:', error);
    res.status(500).json({ message: 'Lỗi lấy danh sách file', error: error.message });
  }
});

// Admin xóa file PDF
router.delete('/admin/file/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin file để xóa file vật lý
    const [files] = await db.query('SELECT file_pdf FROM danh_sach_hoat_dong_file WHERE id = ?', [id]);
    
    if (files.length > 0 && files[0].file_pdf) {
      const filePath = path.join(__dirname, '..', files[0].file_pdf);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.query('DELETE FROM danh_sach_hoat_dong_file WHERE id = ?', [id]);

    res.json({ message: 'Xóa file thành công' });
  } catch (error) {
    console.error('Lỗi xóa file:', error);
    res.status(500).json({ message: 'Lỗi xóa file', error: error.message });
  }
});

// Admin xóa yêu cầu
router.delete('/admin/yeu-cau/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin yêu cầu
    const [requests] = await db.query('SELECT file_excel FROM yeu_cau_danh_sach WHERE id = ?', [id]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
    }

    // Xóa file Excel nếu có
    if (requests[0].file_excel) {
      const filePath = path.join(__dirname, '..', requests[0].file_excel);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Xóa yêu cầu
    await db.query('DELETE FROM yeu_cau_danh_sach WHERE id = ?', [id]);

    res.json({ message: 'Xóa yêu cầu thành công' });
  } catch (error) {
    console.error('Lỗi xóa yêu cầu:', error);
    res.status(500).json({ message: 'Lỗi xóa yêu cầu', error: error.message });
  }
});

// Lấy danh sách CLB (cho dropdown)
router.get('/admin/clubs', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [clubs] = await db.query('SELECT id, ten_clb FROM cau_lac_bo ORDER BY ten_clb');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách CLB', error: error.message });
  }
});

// ==================== API CHO SINH VIÊN ====================

// Sinh viên xem danh sách file PDF (chỉ xem, không chỉnh sửa)
router.get('/sinhvien/danh-sach-file', authenticateToken, async (req, res) => {
  try {
    const { muc_dich, cau_lac_bo_id } = req.query;
    
    let query = `
      SELECT f.*, c.ten_clb 
      FROM danh_sach_hoat_dong_file f
      LEFT JOIN cau_lac_bo c ON f.cau_lac_bo_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (muc_dich) {
      query += ' AND f.muc_dich = ?';
      params.push(muc_dich);
    }

    if (cau_lac_bo_id) {
      query += ' AND f.cau_lac_bo_id = ?';
      params.push(cau_lac_bo_id);
    }

    query += ' ORDER BY f.created_at DESC';

    const [files] = await db.query(query, params);

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách file', error: error.message });
  }
});

// Lấy danh sách CLB (cho filter)
router.get('/sinhvien/clubs', authenticateToken, async (req, res) => {
  try {
    const [clubs] = await db.query('SELECT id, ten_clb FROM cau_lac_bo ORDER BY ten_clb');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách CLB', error: error.message });
  }
});

module.exports = router;
