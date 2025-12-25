-- Thêm CASCADE DELETE cho bảng dang_ky_hoat_dong
-- Khi xóa hoạt động thì tự động xóa các đăng ký liên quan

-- Xóa foreign key constraint cũ
ALTER TABLE dang_ky_hoat_dong 
DROP FOREIGN KEY dang_ky_hoat_dong_ibfk_1;

-- Thêm lại với ON DELETE CASCADE
ALTER TABLE dang_ky_hoat_dong 
ADD CONSTRAINT dang_ky_hoat_dong_ibfk_1 
FOREIGN KEY (hoat_dong_id) 
REFERENCES hoat_dong(id) 
ON DELETE CASCADE;

-- Kiểm tra lại constraint
SHOW CREATE TABLE dang_ky_hoat_dong;
