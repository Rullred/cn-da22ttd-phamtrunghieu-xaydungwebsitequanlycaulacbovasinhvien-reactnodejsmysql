-- Thêm cột mục đích hoạt động vào bảng hoat_dong
-- Chạy: mysql -u root -p ql_clb_sv < backend/database/add_muc_dich.sql

USE ql_clb_sv;

-- Thêm cột muc_dich nếu chưa tồn tại
ALTER TABLE hoat_dong 
ADD COLUMN IF NOT EXISTS muc_dich ENUM(
  've_nguon',      -- Về nguồn
  'van_nghe',      -- Chương trình Văn nghệ
  've_sinh',       -- Vệ sinh
  'ho_tro',        -- Hỗ trợ
  'cuoc_thi',      -- Cuộc thi
  'toa_dam',       -- Tọa đàm
  'the_thao',      -- Thể thao
  'tinh_nguyen',   -- Tình nguyện
  'hoi_thao',      -- Hội thảo
  'khac'           -- Khác
) DEFAULT NULL AFTER so_luong_da_dang_ky;

-- Thêm index cho cột muc_dich
CREATE INDEX IF NOT EXISTS idx_muc_dich ON hoat_dong(muc_dich);

SELECT 'Đã thêm cột muc_dich vào bảng hoat_dong!' as message;
