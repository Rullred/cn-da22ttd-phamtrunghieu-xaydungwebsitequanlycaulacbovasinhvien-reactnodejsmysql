-- Tạo bảng đánh giá (Rating/Feedback)
USE ql_clb_sv;

CREATE TABLE IF NOT EXISTS danh_gia (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category ENUM('giao_dien', 'tinh_nang', 'hieu_nang', 'ho_tro', 'khac') NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  INDEX idx_nguoi_dung (nguoi_dung_id),
  INDEX idx_category (category),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Đã tạo bảng danh_gia thành công!' as message;
