-- Script tự động tạo phòng chat cho các hoạt động và thêm thành viên
USE ql_clb_sv;

-- 1. Tạo phòng chat cho tất cả các hoạt động chưa có phòng
INSERT INTO phong_chat (hoat_dong_id, ma_phong, ten_phong)
SELECT 
  hd.id,
  CONCAT('HD-', hd.id),
  hd.ten_hoat_dong
FROM hoat_dong hd
LEFT JOIN phong_chat pc ON hd.id = pc.hoat_dong_id
WHERE pc.id IS NULL
  AND hd.trang_thai IN ('sap_dien_ra', 'dang_dien_ra');

-- 2. Thêm chủ nhiệm CLB vào phòng chat của hoạt động họ tạo
INSERT IGNORE INTO thanh_vien_phong_chat (phong_chat_id, nguoi_dung_id, vai_tro)
SELECT 
  pc.id,
  clb.chu_nhiem_id,
  'chu_nhiem'
FROM phong_chat pc
JOIN hoat_dong hd ON pc.hoat_dong_id = hd.id
JOIN cau_lac_bo clb ON hd.cau_lac_bo_id = clb.id
WHERE clb.chu_nhiem_id IS NOT NULL;

-- 3. Thêm sinh viên đã được duyệt vào phòng chat
INSERT IGNORE INTO thanh_vien_phong_chat (phong_chat_id, nguoi_dung_id, vai_tro)
SELECT 
  pc.id,
  sv.nguoi_dung_id,
  'sinh_vien'
FROM dang_ky_hoat_dong dk
JOIN sinh_vien sv ON dk.sinh_vien_id = sv.id
JOIN phong_chat pc ON dk.hoat_dong_id = pc.hoat_dong_id
WHERE dk.trang_thai IN ('da_duyet', 'dang_tham_gia', 'hoan_thanh');

-- Xem kết quả
SELECT 
  'Tạo phòng chat' as action,
  COUNT(*) as count
FROM phong_chat
UNION ALL
SELECT 
  'Thêm thành viên' as action,
  COUNT(*) as count
FROM thanh_vien_phong_chat;
