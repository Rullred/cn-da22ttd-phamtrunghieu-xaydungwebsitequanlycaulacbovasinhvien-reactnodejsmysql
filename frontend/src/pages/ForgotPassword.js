import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import './Login.css';

const bgImage = '/bg-doan.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !matKhauMoi || !xacNhanMatKhau) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (matKhauMoi !== xacNhanMatKhau) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (matKhauMoi.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPasswordDirect(email, matKhauMoi);
      alert('Đổi mật khẩu thành công!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra email!');
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
          <h1>Đổi mật khẩu</h1>
          <p>Nhập email và mật khẩu mới của bạn</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaEnvelope /> Email đã đăng ký
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
              <FaLock /> Mật khẩu mới
            </label>
            <input
              type="password"
              className="form-control"
              value={matKhauMoi}
              onChange={(e) => setMatKhauMoi(e.target.value)}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaLock /> Xác nhận mật khẩu
            </label>
            <input
              type="password"
              className="form-control"
              value={xacNhanMatKhau}
              onChange={(e) => setXacNhanMatKhau(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <Link to="/login">← Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
