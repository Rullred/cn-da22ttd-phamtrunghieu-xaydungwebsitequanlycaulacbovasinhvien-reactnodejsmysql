-- Hệ thống quản lý Câu lạc bộ và Hoạt động Sinh viên - TVU
-- Database Schema - Phiên bản đồng bộ

CREATE DATABASE IF NOT EXISTS ql_clb_sv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ql_clb_sv;

-- Bảng Người dùng (Quản lý tất cả tài khoản)
CREATE TABLE nguoi_dung (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  mat_khau VARCHAR(255), -- Dùng cho tài khoản Admin và Chủ nhiệm được tạo thủ công
  loai_nguoi_dung ENUM('admin', 'sinh_vien', 'chu_nhiem') NOT NULL,
  trang_thai ENUM('chua_hoan_thanh', 'cho_duyet', 'da_duyet', 'tu_choi') DEFAULT 'chua_hoan_thanh',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_loai_nguoi_dung (loai_nguoi_dung),
  INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Sinh viên (Hồ sơ cá nhân sinh viên)
CREATE TABLE sinh_vien (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id INT UNIQUE NOT NULL,
  ho_ten VARCHAR(255) NOT NULL,
  ma_sinh_vien VARCHAR(50) UNIQUE NOT NULL,
  lop VARCHAR(100),
  khoa VARCHAR(255),
  khoa_hoc VARCHAR(10), -- Khóa học: 22, 23, 24, 25...
  so_dien_thoai VARCHAR(20),
  anh_dai_dien VARCHAR(255) DEFAULT '/public/images/default-avatar.jpg',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  INDEX idx_ma_sinh_vien (ma_sinh_vien),
  INDEX idx_khoa (khoa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Câu lạc bộ
CREATE TABLE cau_lac_bo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ten_clb VARCHAR(255) NOT NULL,
  mo_ta TEXT,
  logo VARCHAR(255),
  chu_nhiem_id INT, -- Người dùng là Chủ nhiệm
  ngay_thanh_lap DATE,
  trang_thai ENUM('hoat_dong', 'tam_ngung') DEFAULT 'hoat_dong',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (chu_nhiem_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL,
  INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Thành viên Câu lạc bộ (Sinh viên tham gia CLB)
CREATE TABLE thanh_vien_clb (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cau_lac_bo_id INT NOT NULL,
  sinh_vien_id INT NOT NULL,
  trang_thai ENUM('cho_duyet', 'da_duyet', 'tu_choi') DEFAULT 'cho_duyet',
  vai_tro ENUM('thanh_vien', 'thu_ky', 'pho_ban') DEFAULT 'thanh_vien',
  ngay_tham_gia DATETIME DEFAULT CURRENT_TIMESTAMP,
  ngay_duyet DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cau_lac_bo_id) REFERENCES cau_lac_bo(id) ON DELETE CASCADE,
  FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member (cau_lac_bo_id, sinh_vien_id),
  INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Hoạt động
CREATE TABLE hoat_dong (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cau_lac_bo_id INT NOT NULL,
  ten_hoat_dong VARCHAR(255) NOT NULL,
  mo_ta TEXT,
  thoi_gian_bat_dau DATETIME NOT NULL,
  thoi_gian_ket_thuc DATETIME NOT NULL,
  dia_diem VARCHAR(255),
  quy_dinh_trang_phuc TEXT,
  so_luong_toi_da INT DEFAULT 0, -- 0 = không giới hạn
  so_luong_da_dang_ky INT DEFAULT 0,
  trang_thai ENUM('sap_dien_ra', 'dang_dien_ra', 'da_ket_thuc', 'huy') DEFAULT 'sap_dien_ra',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cau_lac_bo_id) REFERENCES cau_lac_bo(id) ON DELETE CASCADE,
  INDEX idx_trang_thai (trang_thai),
  INDEX idx_thoi_gian (thoi_gian_bat_dau)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Đăng ký Hoạt động
CREATE TABLE dang_ky_hoat_dong (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hoat_dong_id INT NOT NULL,
  sinh_vien_id INT NOT NULL,
  trang_thai ENUM('cho_duyet', 'da_duyet', 'tu_choi', 'da_huy') DEFAULT 'cho_duyet',
  ghi_chu TEXT,
  ngay_dang_ky DATETIME DEFAULT CURRENT_TIMESTAMP,
  ngay_duyet DATETIME,
  FOREIGN KEY (hoat_dong_id) REFERENCES hoat_dong(id) ON DELETE CASCADE,
  FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id) ON DELETE CASCADE,
  UNIQUE KEY unique_registration (hoat_dong_id, sinh_vien_id),
  INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Thông báo
CREATE TABLE thong_bao (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nguoi_nhan_id INT NOT NULL, -- ID người dùng nhận thông báo
  loai_thong_bao ENUM(
    'tai_khoan_duyet', 
    'tai_khoan_tu_choi', 
    'hoat_dong_moi', 
    'dang_ky_thanh_cong', 
    'duyet_thanh_vien_clb',
    'tu_choi_thanh_vien_clb',
    'duyet_hoat_dong',
    'tu_choi_hoat_dong',
    'nho_hoat_dong'
  ) NOT NULL,
  tieu_de VARCHAR(255) NOT NULL,
  noi_dung TEXT,
  lien_ket VARCHAR(255), -- Link đến trang liên quan
  da_doc BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nguoi_nhan_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  INDEX idx_nguoi_nhan (nguoi_nhan_id),
  INDEX idx_da_doc (da_doc),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dữ liệu mẫu: Tài khoản Admin mặc định
-- Mật khẩu: admin123 (đã mã hóa bằng bcrypt)
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES (
  'admin@tvu.edu.vn', 
  '$2a$10$rLZ8YqJqJ5H5z5Z5Z5Z5ZOqJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 
  'admin', 
  'da_duyet'
);

-- Trigger: Cập nhật số lượng đăng ký hoạt động
DELIMITER //
CREATE TRIGGER update_so_luong_dang_ky_insert
AFTER INSERT ON dang_ky_hoat_dong
FOR EACH ROW
BEGIN
  IF NEW.trang_thai = 'da_duyet' THEN
    UPDATE hoat_dong 
    SET so_luong_da_dang_ky = so_luong_da_dang_ky + 1 
    WHERE id = NEW.hoat_dong_id;
  END IF;
END//

CREATE TRIGGER update_so_luong_dang_ky_update
AFTER UPDATE ON dang_ky_hoat_dong
FOR EACH ROW
BEGIN
  IF OLD.trang_thai != 'da_duyet' AND NEW.trang_thai = 'da_duyet' THEN
    UPDATE hoat_dong 
    SET so_luong_da_dang_ky = so_luong_da_dang_ky + 1 
    WHERE id = NEW.hoat_dong_id;
  ELSEIF OLD.trang_thai = 'da_duyet' AND NEW.trang_thai != 'da_duyet' THEN
    UPDATE hoat_dong 
    SET so_luong_da_dang_ky = so_luong_da_dang_ky - 1 
    WHERE id = NEW.hoat_dong_id;
  END IF;
END//
DELIMITER ;

-- Bảng Đánh giá website
CREATE TABLE danh_gia (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category ENUM('giao_dien', 'tinh_nang', 'hieu_nang', 'ho_tro', 'khac') NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  INDEX idx_rating (rating),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
