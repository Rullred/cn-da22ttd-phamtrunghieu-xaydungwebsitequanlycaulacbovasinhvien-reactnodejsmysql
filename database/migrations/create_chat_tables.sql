-- Tạo bảng Chat cho hệ thống
-- Chạy file này trong MySQL để tạo các bảng chat

USE ql_clb_sv;

-- Bảng Phòng Chat
CREATE TABLE IF NOT EXISTS phong_chat (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hoat_dong_id INT NOT NULL,
  ma_phong VARCHAR(50) NOT NULL,
  ten_phong VARCHAR(255) NOT NULL,
  trang_thai ENUM('hoat_dong', 'dong') DEFAULT 'hoat_dong',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hoat_dong_id) REFERENCES hoat_dong(id) ON DELETE CASCADE,
  UNIQUE KEY unique_hoat_dong (hoat_dong_id),
  INDEX idx_ma_phong (ma_phong),
  INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Thành viên phòng chat
CREATE TABLE IF NOT EXISTS thanh_vien_phong_chat (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phong_chat_id INT NOT NULL,
  nguoi_dung_id INT NOT NULL,
  vai_tro ENUM('admin', 'chu_nhiem', 'sinh_vien', 'kicked') NOT NULL DEFAULT 'sinh_vien',
  ngay_tham_gia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (phong_chat_id) REFERENCES phong_chat(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member (phong_chat_id, nguoi_dung_id),
  INDEX idx_phong_chat (phong_chat_id),
  INDEX idx_nguoi_dung (nguoi_dung_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Tin nhắn
CREATE TABLE IF NOT EXISTS tin_nhan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phong_chat_id INT NOT NULL,
  nguoi_gui_id INT NOT NULL,
  loai_tin_nhan ENUM('text', 'image', 'icon') DEFAULT 'text',
  noi_dung TEXT,
  hinh_anh VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (phong_chat_id) REFERENCES phong_chat(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_gui_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  INDEX idx_phong_chat (phong_chat_id),
  INDEX idx_nguoi_gui (nguoi_gui_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Đã tạo xong các bảng chat!' as message;
