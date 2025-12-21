-- Bảng lưu yêu cầu làm danh sách từ CLB
CREATE TABLE IF NOT EXISTS yeu_cau_danh_sach (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cau_lac_bo_id INT NOT NULL,
  ten_hoat_dong VARCHAR(255) NOT NULL,
  ngay_to_chuc DATE NOT NULL,
  mo_ta TEXT,
  file_excel VARCHAR(500),
  trang_thai ENUM('cho_xu_ly', 'dang_xu_ly', 'hoan_thanh') DEFAULT 'cho_xu_ly',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cau_lac_bo_id) REFERENCES cau_lac_bo(id) ON DELETE CASCADE
);

-- Bảng lưu file PDF danh sách hoạt động (Admin upload)
CREATE TABLE IF NOT EXISTS danh_sach_hoat_dong_file (
  id INT AUTO_INCREMENT PRIMARY KEY,
  yeu_cau_id INT,
  ten_hoat_dong VARCHAR(255) NOT NULL,
  muc_dich VARCHAR(100),
  cau_lac_bo_id INT,
  file_pdf VARCHAR(500) NOT NULL,
  mo_ta TEXT,
  admin_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (yeu_cau_id) REFERENCES yeu_cau_danh_sach(id) ON DELETE SET NULL,
  FOREIGN KEY (cau_lac_bo_id) REFERENCES cau_lac_bo(id) ON DELETE SET NULL,
  FOREIGN KEY (admin_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);

-- Index để tìm kiếm nhanh
CREATE INDEX idx_yeu_cau_clb ON yeu_cau_danh_sach(cau_lac_bo_id);
CREATE INDEX idx_yeu_cau_trang_thai ON yeu_cau_danh_sach(trang_thai);
CREATE INDEX idx_danh_sach_file_clb ON danh_sach_hoat_dong_file(cau_lac_bo_id);
CREATE INDEX idx_danh_sach_file_muc_dich ON danh_sach_hoat_dong_file(muc_dich);
