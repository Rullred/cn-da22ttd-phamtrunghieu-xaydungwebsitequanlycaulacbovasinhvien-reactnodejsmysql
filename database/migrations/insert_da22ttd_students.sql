-- Import danh sách sinh viên lớp DA22TTD
-- Mật khẩu: 1234567 (đã được hash bằng bcrypt)
-- $2a$10$PAz810wxuvxSdfW6tModyeyETax2v.LH3RgxZ02Dswi9DuMYWvBEe = bcrypt hash của "1234567"

USE ql_clb_sv;

-- Insert người dùng và sinh viên
-- Lớp: DA22TTD, Khoa: Công Nghệ Thông Tin, Khóa học: 2022, Năm sinh: 2004

-- 1. Lâm Tinh Tú
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122249@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Lâm Tinh Tú', '110122249', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0322249249', 2004, '/public/images/default-avatar.jpg');

-- 2. Nguyễn Thanh Triệu
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122248@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Nguyễn Thanh Triệu', '110122248', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0322248248', 2004, '/public/images/default-avatar.jpg');

-- 3. Trần Thanh Thưởng
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122246@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Trần Thanh Thưởng', '110122246', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0322246246', 2004, '/public/images/default-avatar.jpg');

-- 4. Phạm Duy Tân
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122243@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Phạm Duy Tân', '110122243', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0322243243', 2004, '/public/images/default-avatar.jpg');

-- 5. Mai Hồng Lợi
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122106@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Mai Hồng Lợi', '110122106', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0310106106', 2004, '/public/images/default-avatar.jpg');

-- 6. Nguyễn Đỗ Thành Lộc
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122105@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Nguyễn Đỗ Thành Lộc', '110122105', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0310105105', 2004, '/public/images/default-avatar.jpg');

-- 7. Hà Gia Lộc
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122103@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Hà Gia Lộc', '110122103', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0310103103', 2004, '/public/images/default-avatar.jpg');

-- 8. Nguyễn Hoàng Lăm
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122102@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Nguyễn Hoàng Lăm', '110122102', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0310102102', 2004, '/public/images/default-avatar.jpg');

-- 9. Phạm Trung Hiếu
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122076@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Phạm Trung Hiếu', '110122076', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0307076076', 2004, '/public/images/default-avatar.jpg');

-- 10. Đặng Minh Hiếu
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122075@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Đặng Minh Hiếu', '110122075', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0307075075', 2004, '/public/images/default-avatar.jpg');

-- 11. Đàm Thúy Hiền
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122074@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Đàm Thúy Hiền', '110122074', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0307074074', 2004, '/public/images/default-avatar.jpg');

-- 12. Nguyễn Thị Ngọc Hân
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122069@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Nguyễn Thị Ngọc Hân', '110122069', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0306069069', 2004, '/public/images/default-avatar.jpg');

-- 13. Lâm Nhật Hào
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122071@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Lâm Nhật Hào', '110122071', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0307071071', 2004, '/public/images/default-avatar.jpg');

-- 14. Đỗ Gia Hào
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122070@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Đỗ Gia Hào', '110122070', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0307070070', 2004, '/public/images/default-avatar.jpg');

-- 15. Võ Chí Hải
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122068@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Võ Chí Hải', '110122068', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0306068068', 2004, '/public/images/default-avatar.jpg');

-- 16. Trương Hoàng Giang
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122066@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Trương Hoàng Giang', '110122066', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0306066066', 2004, '/public/images/default-avatar.jpg');

-- 17. Trần Minh Đức
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122055@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Trần Minh Đức', '110122055', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0305055055', 2004, '/public/images/default-avatar.jpg');

-- 18. Trần Lâm Phú Đức
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122054@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Trần Lâm Phú Đức', '110122054', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0305054054', 2004, '/public/images/default-avatar.jpg');

-- 19. Trương Mỹ Duyên
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122064@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Trương Mỹ Duyên', '110122064', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0306064064', 2004, '/public/images/default-avatar.jpg');

-- 20. Nguyễn Thanh Duy
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122062@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Nguyễn Thanh Duy', '110122062', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0306062062', 2004, '/public/images/default-avatar.jpg');

-- 21. Nguyễn Lê Duy
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122061@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Nguyễn Lê Duy', '110122061', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0306061061', 2004, '/public/images/default-avatar.jpg');

-- 22. Lê Hà Duy
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122060@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Lê Hà Duy', '110122060', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0306060060', 2004, '/public/images/default-avatar.jpg');

-- 23. Huỳnh Khánh Duy
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122059@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Huỳnh Khánh Duy', '110122059', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0305059059', 2004, '/public/images/default-avatar.jpg');

-- 24. Đào Công Duy
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122058@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Đào Công Duy', '110122058', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0305058058', 2004, '/public/images/default-avatar.jpg');

-- 25. Hồ Nguyễn Quốc Dũng
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122056@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Hồ Nguyễn Quốc Dũng', '110122056', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0305056056', 2004, '/public/images/default-avatar.jpg');

-- 26. Liễu Kiện An
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122028@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Liễu Kiện An', '110122028', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0302028028', 2004, '/public/images/default-avatar.jpg');

-- 27. Phùng Quốc Kiệt
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122101@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Phùng Quốc Kiệt', '110122101', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0310101101', 2004, '/public/images/default-avatar.jpg');

-- 28. Huỳnh Quốc Kiệt
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122100@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Huỳnh Quốc Kiệt', '110122100', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0310100100', 2004, '/public/images/default-avatar.jpg');

-- 29. Hoàng Tuấn Kiệt
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122099@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Hoàng Tuấn Kiệt', '110122099', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0309099099', 2004, '/public/images/default-avatar.jpg');

-- 30. Đặng Gia Kiệt
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122098@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Đặng Gia Kiệt', '110122098', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0309098098', 2004, '/public/images/default-avatar.jpg');

-- 31. Nguyễn Minh Khởi
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122097@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Nguyễn Minh Khởi', '110122097', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0309097097', 2004, '/public/images/default-avatar.jpg');

-- 32. Nguyễn Ngọc Anh Khoa
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122095@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Nguyễn Ngọc Anh Khoa', '110122095', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0309095095', 2004, '/public/images/default-avatar.jpg');

-- 33. Nguyễn Đinh Tuấn Khoa
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122094@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Nguyễn Đinh Tuấn Khoa', '110122094', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0309094094', 2004, '/public/images/default-avatar.jpg');

-- 34. Hồ Anh Khoa
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122093@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Hồ Anh Khoa', '110122093', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0309093093', 2004, '/public/images/default-avatar.jpg');

-- 35. Ngô Huỳnh Quốc Khang
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122092@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Ngô Huỳnh Quốc Khang', '110122092', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0309092092', 2004, '/public/images/default-avatar.jpg');

-- 36. La Thuấn Khang
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122090@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'La Thuấn Khang', '110122090', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0309090090', 2004, '/public/images/default-avatar.jpg');

-- 37. Phan Đình Khải
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122089@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Phan Đình Khải', '110122089', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0308089089', 2004, '/public/images/default-avatar.jpg');

-- 38. Trầm Tấn Khá
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122087@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Trầm Tấn Khá', '110122087', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0308087087', 2004, '/public/images/default-avatar.jpg');

-- 39. Lê Tuấn Kha
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122086@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Lê Tuấn Kha', '110122086', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0308086086', 2004, '/public/images/default-avatar.jpg');

-- 40. Đỗ Thị Kim Hương
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122083@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Đỗ Thị Kim Hương', '110122083', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0308083083', 2004, '/public/images/default-avatar.jpg');

-- 41. Châu Thị Mỹ Hương
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122082@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Châu Thị Mỹ Hương', '110122082', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0308082082', 2004, '/public/images/default-avatar.jpg');

-- 42. Trần Tấn Hưng
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122081@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Trần Tấn Hưng', '110122081', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0308081081', 2004, '/public/images/default-avatar.jpg');

-- 43. Nguyễn Phi Hùng
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122079@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Nguyễn Phi Hùng', '110122079', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0307079079', 2004, '/public/images/default-avatar.jpg');

-- 44. Nguyễn Văn Hoàng
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122078@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Nguyễn Văn Hoàng', '110122078', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0307078078', 2004, '/public/images/default-avatar.jpg');

-- 45. Huỳnh Minh Khải Hoàn
INSERT INTO nguoi_dung (email, mat_khau, loai_nguoi_dung, trang_thai) 
VALUES ('110122077@st.tvu.edu.vn', '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq', 'sinh_vien', 'da_duyet');
INSERT INTO sinh_vien (nguoi_dung_id, ho_ten, ma_sinh_vien, lop, khoa, khoa_hoc, so_dien_thoai, nam_sinh, anh_dai_dien)
VALUES (LAST_INSERT_ID(), N'Huỳnh Minh Khải Hoàn', '110122077', N'DA22TTD', N'Công Nghệ Thông Tin', '2022', '0307077077', 2004, '/public/images/default-avatar.jpg');

-- Kết quả: Đã tạo 45 tài khoản sinh viên lớp DA22TTD
SELECT 'Đã import thành công 45 tài khoản sinh viên lớp DA22TTD!' AS KetQua;
