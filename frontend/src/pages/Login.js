import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { FaUser, FaLock } from 'react-icons/fa';
import './Login.css';

const bgImage = '/bg-doan.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, matKhau);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Điều hướng dựa trên loại người dùng
      if (user.loai_nguoi_dung === 'admin') {
        navigate('/admin');
      } else if (user.loai_nguoi_dung === 'chu_nhiem') {
        navigate('/caulacbo');
      } else if (user.loai_nguoi_dung === 'sinh_vien') {
        navigate('/sinhvien');
      }
      
      // Reload để cập nhật navbar
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
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
    <div className="login-container" style={containerStyle}>
      <div className="login-box">
        <div className="login-header">
          <h1>Đăng nhập</h1>
          <p>Hệ thống quản lý CLB & Hoạt động SV - TVU</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>
              <FaUser /> Email
            </label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaLock /> Mật khẩu
            </label>
            <input
              type="password"
              className="form-control"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
