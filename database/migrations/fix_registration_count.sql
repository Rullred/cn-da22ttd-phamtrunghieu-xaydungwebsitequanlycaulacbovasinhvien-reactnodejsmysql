-- Fix registration count for all activities
-- Count only active registrations (cho_duyet, dang_tham_gia, hoan_thanh, da_duyet)
-- Exclude rejected (tu_choi) and cancelled (da_huy) registrations

UPDATE hoat_dong 
SET so_luong_da_dang_ky = (
    SELECT COUNT(*) 
    FROM dang_ky_hoat_dong 
    WHERE hoat_dong_id = hoat_dong.id 
    AND trang_thai IN ('cho_duyet', 'dang_tham_gia', 'hoan_thanh', 'da_duyet')
)
WHERE trang_thai != 'huy';
