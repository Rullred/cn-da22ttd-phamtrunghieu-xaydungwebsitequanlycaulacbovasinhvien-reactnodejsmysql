import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { FaUser, FaLock, FaEnvelope, FaIdCard, FaGraduationCap, FaCalendar } from 'react-icons/fa';
import './Register.css';

const bgImage = '/bg-doan.png';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    mat_khau: '',
    xac_nhan_mat_khau: '',
    ho_ten: '',
    ma_sinh_vien: '',
    lop: '',
    khoa: '',
    khoa_hoc: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate
    if (!formData.email.endsWith('@st.tvu.edu.vn')) {
      setError('Email phải là email sinh viên của trường (@st.tvu.edu.vn)');
      setLoading(false);
      return;
    }

    if (formData.mat_khau.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    if (formData.mat_khau !== formData.xac_nhan_mat_khau) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register(formData);
      setSuccess(response.data.message);
      
      // Lưu token và user vào localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Chuyển hướng đến trang sinh viên sau 1.5 giây
        setTimeout(() => {
          window.location.href = '/sinhvien';
        }, 1500);
      } else {
        // Nếu không có token, chuyển về trang login
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi đăng ký tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    backgroundImage: `linear-gradient(rgba(33, 150, 243, 0.5), rgba(25, 118, 210, 0.5)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  return (
    <div className="register-container" style={containerStyle}>
      <div className="register-box">
        <div className="register-header">
          <h1>Đăng ký tài khoản</h1>
          <p>Hệ thống quản lý CLB & Hoạt động SV - TVU</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Logo Thanh Niên Việt Nam - Avatar mặc định */}
          <div className="avatar-display">
            <div className="avatar-preview">
              <img src="/default-avatar.png" alt="Avatar" />
            </div>
            <p className="avatar-text">Avatar mặc định</p>
          </div>

          {/* Thông tin đăng nhập */}
          <div className="form-section">
            <h3>Thông tin đăng nhập</h3>
            
            <div className="form-group">
              <label>
                <FaEnvelope /> Email sinh viên *
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="vd: sinhvien@st.tvu.edu.vn"
                required
              />
              <small className="form-text">Sử dụng email sinh viên của trường (@st.tvu.edu.vn)</small>
            </div>

            <div className="form-group">
              <label>
                <FaLock /> Mật khẩu *
              </label>
              <input
                type="password"
                name="mat_khau"
                className="form-control"
                value={formData.mat_khau}
                onChange={handleChange}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FaLock /> Xác nhận mật khẩu *
              </label>
              <input
                type="password"
                name="xac_nhan_mat_khau"
                className="form-control"
                value={formData.xac_nhan_mat_khau}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>
          </div>

          {/* Thông tin cá nhân */}
          <div className="form-section">
            <h3>Thông tin cá nhân</h3>

            <div className="form-group">
              <label>
                <FaUser /> Họ và tên *
              </label>
              <input
                type="text"
                name="ho_ten"
                className="form-control"
                value={formData.ho_ten}
                onChange={handleChange}
                placeholder="Nhập họ và tên đầy đủ"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FaIdCard /> Mã số sinh viên *
              </label>
              <input
                type="text"
                name="ma_sinh_vien"
                className="form-control"
                value={formData.ma_sinh_vien}
                onChange={handleChange}
                placeholder="Nhập mã sinh viên"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaGraduationCap /> Lớp *
                </label>
                <input
                  type="text"
                  name="lop"
                  className="form-control"
                  value={formData.lop}
                  onChange={handleChange}
                  placeholder="Nhập lớp"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FaCalendar /> Khóa học *
                </label>
                <select
                  name="khoa_hoc"
                  className="form-control"
                  value={formData.khoa_hoc}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn khóa</option>
                  <option value="22">Khóa 22</option>
                  <option value="23">Khóa 23</option>
                  <option value="24">Khóa 24</option>
                  <option value="25">Khóa 25</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>
                <FaGraduationCap /> Khoa *
              </label>
              <select
                name="khoa"
                className="form-control"
                value={formData.khoa}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn khoa --</option>
                <option value="Khoa Công Nghệ Thông Tin">Khoa Công Nghệ Thông Tin</option>
                <option value="Khoa Công Nghệ Ôtô">Khoa Công Nghệ Ôtô</option>
                <option value="Khoa Xây Dựng">Khoa Xây Dựng</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
