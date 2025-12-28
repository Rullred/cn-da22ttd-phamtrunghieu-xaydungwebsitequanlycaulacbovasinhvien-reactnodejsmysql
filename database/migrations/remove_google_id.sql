-- Migration: Xóa cột google_id khỏi bảng nguoi_dung
-- Ngày: December 26, 2025
-- Lý do: Không sử dụng đăng nhập Google OAuth

USE ql_clb_sv;

-- Kiểm tra xem cột google_id có tồn tại không trước khi xóa
SELECT COUNT(*) AS column_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'ql_clb_sv' 
  AND TABLE_NAME = 'nguoi_dung' 
  AND COLUMN_NAME = 'google_id';

-- Xóa cột google_id nếu tồn tại
ALTER TABLE nguoi_dung 
DROP COLUMN IF EXISTS google_id;

-- Verify kết quả
DESCRIBE nguoi_dung;

-- Ghi log
SELECT 'Migration completed: google_id column removed from nguoi_dung table' AS status;
