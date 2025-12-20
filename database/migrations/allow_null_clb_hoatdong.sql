-- Migration: Cho phép hoạt động không thuộc CLB nào (Admin tạo)
USE ql_clb_sv;

-- Xóa foreign key constraint cũ
ALTER TABLE hoat_dong DROP FOREIGN KEY IF EXISTS hoat_dong_ibfk_1;

-- Sửa cột cau_lac_bo_id cho phép NULL
ALTER TABLE hoat_dong MODIFY COLUMN cau_lac_bo_id INT NULL;

-- Thêm lại foreign key với ON DELETE SET NULL
ALTER TABLE hoat_dong 
ADD CONSTRAINT hoat_dong_ibfk_1 
FOREIGN KEY (cau_lac_bo_id) REFERENCES cau_lac_bo(id) ON DELETE SET NULL;

SELECT 'Migration completed: cau_lac_bo_id now allows NULL!' as status;
