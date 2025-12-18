-- Schema cho tính năng Chat Room hoạt động
-- Chạy file này để thêm bảng chat vào database

USE ql_clb_sv;

-- Bảng Phòng Chat (mỗi hoạt động có 1 phòng chat)
CREATE TABLE IF NOT EXISTS phong_chat (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hoat_dong_id INT NOT NULL,
  ma_phong VARCHAR(50) NOT NULL, -- Mã phòng: VD "HD-1", "HD-2"
  ten_phong VARCHAR(255) NOT NULL, -- Tên phòng = tên hoạt động
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
  vai_tro ENUM('admin', 'chu_nhiem', 'sinh_vien') NOT NULL,
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
  noi_dung TEXT, -- Nội dung text hoặc emoji
  hinh_anh VARCHAR(255), -- Đường dẫn hình ảnh nếu là image
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (phong_chat_id) REFERENCES phong_chat(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_gui_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  INDEX idx_phong_chat (phong_chat_id),
  INDEX idx_nguoi_gui (nguoi_gui_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger: Tự động tạo phòng chat khi tạo hoạt động mới
DELIMITER //
CREATE TRIGGER create_chat_room_after_activity
AFTER INSERT ON hoat_dong
FOR EACH ROW
BEGIN
  INSERT INTO phong_chat (hoat_dong_id, ma_phong, ten_phong)
  VALUES (NEW.id, CONCAT('HD-', NEW.id), NEW.ten_hoat_dong);
  
  -- Thêm chủ nhiệm CLB vào phòng chat
  INSERT INTO thanh_vien_phong_chat (phong_chat_id, nguoi_dung_id, vai_tro)
  SELECT LAST_INSERT_ID(), clb.chu_nhiem_id, 'chu_nhiem'
  FROM cau_lac_bo clb
  WHERE clb.id = NEW.cau_lac_bo_id AND clb.chu_nhiem_id IS NOT NULL;
END//
DELIMITER ;

-- Trigger: Thêm sinh viên vào phòng chat khi đăng ký được duyệt
DELIMITER //
CREATE TRIGGER add_student_to_chat_on_approve
AFTER UPDATE ON dang_ky_hoat_dong
FOR EACH ROW
BEGIN
  DECLARE v_phong_chat_id INT;
  DECLARE v_nguoi_dung_id INT;
  
  IF OLD.trang_thai != 'da_duyet' AND NEW.trang_thai = 'da_duyet' THEN
    -- Lấy phòng chat của hoạt động
    SELECT id INTO v_phong_chat_id FROM phong_chat WHERE hoat_dong_id = NEW.hoat_dong_id;
    
    -- Lấy nguoi_dung_id của sinh viên
    SELECT nguoi_dung_id INTO v_nguoi_dung_id FROM sinh_vien WHERE id = NEW.sinh_vien_id;
    
    -- Thêm sinh viên vào phòng chat
    IF v_phong_chat_id IS NOT NULL AND v_nguoi_dung_id IS NOT NULL THEN
      INSERT IGNORE INTO thanh_vien_phong_chat (phong_chat_id, nguoi_dung_id, vai_tro)
      VALUES (v_phong_chat_id, v_nguoi_dung_id, 'sinh_vien');
    END IF;
  END IF;
END//
DELIMITER ;
