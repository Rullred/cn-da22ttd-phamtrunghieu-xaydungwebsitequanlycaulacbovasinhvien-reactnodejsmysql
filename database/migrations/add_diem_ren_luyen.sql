-- Migration: Thêm điểm rèn luyện cho hoạt động và sinh viên
-- Ngày: 2025-12-21

-- 1. Thêm cột điểm rèn luyện vào bảng hoạt động
ALTER TABLE hoat_dong 
ADD COLUMN diem_ren_luyen INT DEFAULT 0 COMMENT 'Điểm rèn luyện khi hoàn thành hoạt động';

-- 2. Thêm cột tổng điểm rèn luyện vào bảng sinh viên
ALTER TABLE sinh_vien 
ADD COLUMN tong_diem_ren_luyen INT DEFAULT 0 COMMENT 'Tổng điểm rèn luyện tích lũy';

-- 3. Cập nhật điểm rèn luyện cho các hoạt động hiện có dựa trên mục đích
UPDATE hoat_dong SET diem_ren_luyen = 2 WHERE muc_dich = 've_nguon';
UPDATE hoat_dong SET diem_ren_luyen = 2 WHERE muc_dich = 'van_nghe';
UPDATE hoat_dong SET diem_ren_luyen = 2 WHERE muc_dich = 've_sinh';
UPDATE hoat_dong SET diem_ren_luyen = 2 WHERE muc_dich = 'ho_tro';
UPDATE hoat_dong SET diem_ren_luyen = 3 WHERE muc_dich = 'cuoc_thi';
UPDATE hoat_dong SET diem_ren_luyen = 4 WHERE muc_dich = 'toa_dam';
UPDATE hoat_dong SET diem_ren_luyen = 3 WHERE muc_dich = 'the_thao';
UPDATE hoat_dong SET diem_ren_luyen = 3 WHERE muc_dich = 'tinh_nguyen';
UPDATE hoat_dong SET diem_ren_luyen = 4 WHERE muc_dich = 'hoi_thao';
UPDATE hoat_dong SET diem_ren_luyen = 1 WHERE muc_dich = 'khac';

-- 4. Cập nhật tổng điểm rèn luyện cho sinh viên đã hoàn thành hoạt động
UPDATE sinh_vien sv
SET tong_diem_ren_luyen = (
  SELECT COALESCE(SUM(hd.diem_ren_luyen), 0)
  FROM dang_ky_hoat_dong dk
  JOIN hoat_dong hd ON dk.hoat_dong_id = hd.id
  WHERE dk.sinh_vien_id = sv.id AND dk.trang_thai = 'hoan_thanh'
);

-- 5. Tạo index cho việc sắp xếp top sinh viên
CREATE INDEX idx_tong_diem ON sinh_vien(tong_diem_ren_luyen DESC);
