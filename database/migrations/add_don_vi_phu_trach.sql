-- Migration: Thêm cột don_vi_phu_trach và cho phép cau_lac_bo_id NULL
USE ql_clb_sv;

-- Thêm cột don_vi_phu_trach cho hoạt động Admin tạo
ALTER TABLE hoat_dong 
ADD COLUMN IF NOT EXISTS don_vi_phu_trach VARCHAR(255) NULL AFTER cau_lac_bo_id;

-- Thêm cột is_admin_activity để phân biệt hoạt động Admin tạo
ALTER TABLE hoat_dong 
ADD COLUMN IF NOT EXISTS is_admin_activity BOOLEAN DEFAULT FALSE AFTER don_vi_phu_trach;

-- Xóa foreign key constraint cũ nếu có
SET FOREIGN_KEY_CHECKS = 0;

-- Sửa cột cau_lac_bo_id cho phép NULL (hoạt động Admin không thuộc CLB)
ALTER TABLE hoat_dong MODIFY COLUMN cau_lac_bo_id INT NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- Thêm index
CREATE INDEX IF NOT EXISTS idx_is_admin_activity ON hoat_dong(is_admin_activity);

SELECT 'Migration completed: Added don_vi_phu_trach and is_admin_activity columns!' as status;
