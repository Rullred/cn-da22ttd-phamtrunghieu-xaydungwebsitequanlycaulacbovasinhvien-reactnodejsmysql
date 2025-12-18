-- Script cập nhật bảng dang_ky_hoat_dong để hỗ trợ 2 lần duyệt
USE ql_clb_sv;

-- Xóa trigger cũ
DROP TRIGGER IF EXISTS update_so_luong_dang_ky_insert;
DROP TRIGGER IF EXISTS update_so_luong_dang_ky_update;

-- Thêm cột mới nếu chưa có
ALTER TABLE dang_ky_hoat_dong 
ADD COLUMN ngay_duyet_lan_1 DATETIME COMMENT 'Duyệt cho tham gia hoạt động';

ALTER TABLE dang_ky_hoat_dong 
ADD COLUMN ngay_duyet_lan_2 DATETIME COMMENT 'Xác nhận đã tham gia xong';

-- Cập nhật ENUM cho trạng thái
ALTER TABLE dang_ky_hoat_dong 
MODIFY COLUMN trang_thai ENUM('cho_duyet', 'da_duyet', 'tu_choi', 'da_huy', 'dang_tham_gia', 'hoan_thanh') DEFAULT 'cho_duyet';

-- Migrate dữ liệu cũ (nếu có)
-- Những bản ghi có trang_thai = 'da_duyet' sẽ chuyển thành 'dang_tham_gia'
UPDATE dang_ky_hoat_dong 
SET 
  trang_thai = 'dang_tham_gia',
  ngay_duyet_lan_1 = ngay_duyet
WHERE trang_thai = 'da_duyet' AND ngay_duyet IS NOT NULL;

-- Xóa cột cũ nếu muốn (tùy chọn)
-- ALTER TABLE dang_ky_hoat_dong DROP COLUMN ngay_duyet;

-- Tạo trigger mới
DELIMITER //

CREATE TRIGGER update_so_luong_dang_ky_insert
AFTER INSERT ON dang_ky_hoat_dong
FOR EACH ROW
BEGIN
  IF NEW.trang_thai = 'dang_tham_gia' THEN
    UPDATE hoat_dong 
    SET so_luong_da_dang_ky = so_luong_da_dang_ky + 1 
    WHERE id = NEW.hoat_dong_id;
  END IF;
END//

CREATE TRIGGER update_so_luong_dang_ky_update
AFTER UPDATE ON dang_ky_hoat_dong
FOR EACH ROW
BEGIN
  IF OLD.trang_thai != 'dang_tham_gia' AND NEW.trang_thai = 'dang_tham_gia' THEN
    UPDATE hoat_dong 
    SET so_luong_da_dang_ky = so_luong_da_dang_ky + 1 
    WHERE id = NEW.hoat_dong_id;
  ELSEIF OLD.trang_thai = 'dang_tham_gia' AND NEW.trang_thai != 'dang_tham_gia' THEN
    UPDATE hoat_dong 
    SET so_luong_da_dang_ky = so_luong_da_dang_ky - 1 
    WHERE id = NEW.hoat_dong_id;
  END IF;
END//

DELIMITER ;
