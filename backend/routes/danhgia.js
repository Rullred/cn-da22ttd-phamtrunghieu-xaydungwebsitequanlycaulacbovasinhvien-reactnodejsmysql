const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const db = require('../config/database');

// POST /api/danhgia - Tạo đánh giá mới
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { rating, category, feedback } = req.body;
    const nguoi_dung_id = req.user.id;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating phải từ 1 đến 5' });
    }

    if (!category) {
      return res.status(400).json({ message: 'Category là bắt buộc' });
    }

    const validCategories = ['giao_dien', 'tinh_nang', 'hieu_nang', 'ho_tro', 'khac'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Category không hợp lệ' });
    }

    // Insert đánh giá
    const query = `
      INSERT INTO danh_gia (nguoi_dung_id, rating, category, feedback)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      nguoi_dung_id,
      rating,
      category,
      feedback || null
    ]);

    res.status(201).json({
      message: 'Đánh giá đã được gửi thành công',
      id: result.insertId
    });

  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/danhgia - Lấy danh sách đánh giá (chỉ admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.loai_nguoi_dung !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const query = `
      SELECT 
        dg.id,
        dg.rating,
        dg.category,
        dg.feedback,
        dg.created_at,
        nd.loai_nguoi_dung as user_type,
        CASE 
          WHEN nd.loai_nguoi_dung = 'sinh_vien' THEN sv.ho_ten
          WHEN nd.loai_nguoi_dung = 'chu_nhiem' THEN clb.ten_clb
          ELSE 'Admin'
        END as user_name
      FROM danh_gia dg
      JOIN nguoi_dung nd ON dg.nguoi_dung_id = nd.id
      LEFT JOIN sinh_vien sv ON nd.id = sv.nguoi_dung_id
      LEFT JOIN cau_lac_bo clb ON nd.id = clb.chu_nhiem_id
      ORDER BY dg.created_at DESC
    `;

    const [ratings] = await db.query(query);

    // Tính toán thống kê
    const total = ratings.length;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => distribution[r.rating]++);

    res.json({
      ratings,
      statistics: {
        average: total > 0 ? (sum / total).toFixed(1) : 0,
        total,
        distribution
      }
    });

  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/danhgia/stats - Lấy thống kê đánh giá
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.loai_nguoi_dung !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const query = `
      SELECT 
        COUNT(*) as total,
        AVG(rating) as average,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM danh_gia
    `;

    const [stats] = await db.query(query);

    res.json({
      total: stats[0].total,
      average: parseFloat(stats[0].average || 0).toFixed(1),
      distribution: {
        5: stats[0].five_star,
        4: stats[0].four_star,
        3: stats[0].three_star,
        2: stats[0].two_star,
        1: stats[0].one_star
      }
    });

  } catch (error) {
    console.error('Get rating stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
