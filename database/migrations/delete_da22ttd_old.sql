-- Xóa tất cả sinh viên lớp DA22TTD cũ
USE ql_clb_sv;

-- Tắt kiểm tra khóa ngoại tạm thời
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa tất cả người dùng có email sinh viên DA22TTD
DELETE FROM nguoi_dung WHERE email LIKE '110122%@st.tvu.edu.vn';

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Đã xóa tất cả tài khoản sinh viên lớp DA22TTD!' AS KetQua;
