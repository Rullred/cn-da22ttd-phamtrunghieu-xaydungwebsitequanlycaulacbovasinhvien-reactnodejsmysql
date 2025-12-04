-- Tạo database và user cho hệ thống quản lý CLB
CREATE DATABASE IF NOT EXISTS ql_clb_sv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user và phân quyền
CREATE USER IF NOT EXISTS 'qlclb_user'@'%' IDENTIFIED BY 'qlclb_password';
GRANT ALL PRIVILEGES ON ql_clb_sv.* TO 'qlclb_user'@'%';
FLUSH PRIVILEGES;

USE ql_clb_sv;

-- Bảng người dùng
CREATE TABLE IF NOT EXISTS nguoi_dung (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    mat_khau VARCHAR(255),
    loai_nguoi_dung ENUM('admin', 'sinh_vien', 'chu_nhiem') NOT NULL,
    trang_thai ENUM('chua_hoan_thanh', 'cho_duyet', 'da_duyet', 'tu_choi') DEFAULT 'chua_hoan_thanh',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_loai_nguoi_dung (loai_nguoi_dung),
    INDEX idx_trang_thai (trang_thai)
);

-- Bảng sinh viên (Hồ sơ cá nhân sinh viên)
CREATE TABLE IF NOT EXISTS sinh_vien (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nguoi_dung_id INT UNIQUE NOT NULL,
    ho_ten VARCHAR(255) NOT NULL,
    ma_sinh_vien VARCHAR(50) UNIQUE NOT NULL,
    lop VARCHAR(100),
    khoa VARCHAR(255),
    nam_sinh INT,
    so_dien_thoai VARCHAR(20),
    anh_dai_dien VARCHAR(255) DEFAULT '/public/images/default-avatar.jpg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    INDEX idx_ma_sinh_vien (ma_sinh_vien),
    INDEX idx_khoa (khoa)
);

-- Bảng câu lạc bộ
CREATE TABLE IF NOT EXISTS cau_lac_bo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_clb VARCHAR(100) NOT NULL,
    mo_ta TEXT,
    logo VARCHAR(255),
    chu_nhiem_id INT,
    ngay_thanh_lap DATE,
    trang_thai ENUM('hoat_dong', 'tam_ngung') DEFAULT 'hoat_dong',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chu_nhiem_id) REFERENCES nguoi_dung(id)
);

-- Bảng thành viên CLB
CREATE TABLE IF NOT EXISTS thanh_vien_clb (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cau_lac_bo_id INT NOT NULL,
    sinh_vien_id INT NOT NULL,
    trang_thai ENUM('cho_duyet', 'da_duyet', 'tu_choi') DEFAULT 'cho_duyet',
    vai_tro ENUM('thanh_vien', 'thu_ky', 'pho_ban') DEFAULT 'thanh_vien',
    ngay_tham_gia DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_duyet DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cau_lac_bo_id) REFERENCES cau_lac_bo(id),
    FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id),
    UNIQUE KEY unique_member (cau_lac_bo_id, sinh_vien_id)
);

-- Bảng hoạt động
CREATE TABLE IF NOT EXISTS hoat_dong (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cau_lac_bo_id INT NOT NULL,
    ten_hoat_dong VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    thoi_gian_bat_dau DATETIME NOT NULL,
    thoi_gian_ket_thuc DATETIME NOT NULL,
    dia_diem VARCHAR(255),
    quy_dinh_trang_phuc TEXT,
    so_luong_toi_da INT DEFAULT 0,
    so_luong_da_dang_ky INT DEFAULT 0,
    trang_thai ENUM('sap_dien_ra', 'dang_dien_ra', 'da_ket_thuc', 'huy') DEFAULT 'sap_dien_ra',
    trang_thai_duyet ENUM('cho_duyet', 'da_duyet', 'tu_choi') DEFAULT 'cho_duyet',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cau_lac_bo_id) REFERENCES cau_lac_bo(id),
    INDEX idx_trang_thai_duyet (trang_thai_duyet)
);

-- Bảng đăng ký hoạt động
CREATE TABLE IF NOT EXISTS dang_ky_hoat_dong (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hoat_dong_id INT NOT NULL,
    sinh_vien_id INT NOT NULL,
    trang_thai ENUM('cho_duyet', 'da_duyet', 'tu_choi', 'da_huy') DEFAULT 'cho_duyet',
    ghi_chu TEXT,
    ngay_dang_ky DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_duyet DATETIME,
    FOREIGN KEY (hoat_dong_id) REFERENCES hoat_dong(id),
    FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id),
    UNIQUE KEY unique_registration (hoat_dong_id, sinh_vien_id)
);

-- Bảng thông báo
CREATE TABLE IF NOT EXISTS thong_bao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nguoi_nhan_id INT NOT NULL,
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
    lien_ket VARCHAR(255),
    da_doc BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_nhan_id) REFERENCES nguoi_dung(id)
);

