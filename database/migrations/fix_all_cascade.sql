-- Fix CASCADE DELETE
USE ql_clb_sv;

-- Xóa và tạo lại foreign keys cho thanh_vien_clb
ALTER TABLE thanh_vien_clb DROP FOREIGN KEY thanh_vien_clb_ibfk_1;
ALTER TABLE thanh_vien_clb DROP FOREIGN KEY thanh_vien_clb_ibfk_2;
ALTER TABLE thanh_vien_clb ADD CONSTRAINT thanh_vien_clb_ibfk_1 FOREIGN KEY (cau_lac_bo_id) REFERENCES cau_lac_bo(id) ON DELETE CASCADE;
ALTER TABLE thanh_vien_clb ADD CONSTRAINT thanh_vien_clb_ibfk_2 FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id) ON DELETE CASCADE;

-- Xóa và tạo lại foreign keys cho thong_bao
ALTER TABLE thong_bao DROP FOREIGN KEY thong_bao_ibfk_1;
ALTER TABLE thong_bao ADD CONSTRAINT thong_bao_ibfk_1 FOREIGN KEY (nguoi_nhan_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE;

-- Tạo lại foreign keys cho dang_ky_hoat_dong
ALTER TABLE dang_ky_hoat_dong ADD CONSTRAINT dang_ky_hoat_dong_ibfk_1 FOREIGN KEY (hoat_dong_id) REFERENCES hoat_dong(id) ON DELETE CASCADE;
ALTER TABLE dang_ky_hoat_dong ADD CONSTRAINT dang_ky_hoat_dong_ibfk_2 FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id) ON DELETE CASCADE;
