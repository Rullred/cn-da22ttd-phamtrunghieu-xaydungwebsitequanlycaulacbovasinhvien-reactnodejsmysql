-- Cập nhật bảng yeu_cau_danh_sach để thêm hoat_dong_id
-- Cho phép gửi yêu cầu minh chứng trực tiếp từ hoạt động đã hoàn thành

-- Thêm cột hoat_dong_id nếu chưa có
ALTER TABLE yeu_cau_danh_sach 
ADD COLUMN IF NOT EXISTS hoat_dong_id INT DEFAULT NULL AFTER cau_lac_bo_id,
ADD FOREIGN KEY IF NOT EXISTS (hoat_dong_id) REFERENCES hoat_dong(id) ON DELETE CASCADE;

-- Tạo index để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_yeu_cau_hoat_dong ON yeu_cau_danh_sach(hoat_dong_id);

-- Cập nhật các yêu cầu cũ: cho phép null cho các trường không bắt buộc nữa
ALTER TABLE yeu_cau_danh_sach 
MODIFY COLUMN ten_hoat_dong VARCHAR(255) NULL,
MODIFY COLUMN ngay_to_chuc DATE NULL;
