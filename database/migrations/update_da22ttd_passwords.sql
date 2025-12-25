-- Cập nhật mật khẩu cho các tài khoản sinh viên lớp DA22TTD
-- Mật khẩu mới: 1234567 (hash bcrypt thật)

USE ql_clb_sv;

UPDATE nguoi_dung 
SET mat_khau = '$2a$10$8ZBKld2IFL.VXIA4/2WpU.ectmGEnPyC4N9vQjrhDmo7BfVHoMrrq'
WHERE email IN (
    '110122249@st.tvu.edu.vn',
    '110122248@st.tvu.edu.vn',
    '110122246@st.tvu.edu.vn',
    '110122243@st.tvu.edu.vn',
    '110122106@st.tvu.edu.vn',
    '110122105@st.tvu.edu.vn',
    '110122103@st.tvu.edu.vn',
    '110122102@st.tvu.edu.vn',
    '110122076@st.tvu.edu.vn',
    '110122075@st.tvu.edu.vn',
    '110122074@st.tvu.edu.vn',
    '110122069@st.tvu.edu.vn',
    '110122071@st.tvu.edu.vn',
    '110122070@st.tvu.edu.vn',
    '110122068@st.tvu.edu.vn',
    '110122066@st.tvu.edu.vn',
    '110122055@st.tvu.edu.vn',
    '110122054@st.tvu.edu.vn',
    '110122064@st.tvu.edu.vn',
    '110122062@st.tvu.edu.vn',
    '110122061@st.tvu.edu.vn',
    '110122060@st.tvu.edu.vn',
    '110122059@st.tvu.edu.vn',
    '110122058@st.tvu.edu.vn',
    '110122056@st.tvu.edu.vn',
    '110122028@st.tvu.edu.vn',
    '110122101@st.tvu.edu.vn',
    '110122100@st.tvu.edu.vn',
    '110122099@st.tvu.edu.vn',
    '110122098@st.tvu.edu.vn',
    '110122097@st.tvu.edu.vn',
    '110122095@st.tvu.edu.vn',
    '110122094@st.tvu.edu.vn',
    '110122093@st.tvu.edu.vn',
    '110122092@st.tvu.edu.vn',
    '110122090@st.tvu.edu.vn',
    '110122089@st.tvu.edu.vn',
    '110122087@st.tvu.edu.vn',
    '110122086@st.tvu.edu.vn',
    '110122083@st.tvu.edu.vn',
    '110122082@st.tvu.edu.vn',
    '110122081@st.tvu.edu.vn',
    '110122079@st.tvu.edu.vn',
    '110122078@st.tvu.edu.vn',
    '110122077@st.tvu.edu.vn'
);

SELECT CONCAT('Đã cập nhật mật khẩu cho ', ROW_COUNT(), ' tài khoản sinh viên!') AS KetQua;
