import React, { useState, useEffect } from 'react';
import { authService, sinhvienService } from '../../services/api';
import Loading from '../../components/Loading';
import { FaUser } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    ho_ten: '',
    lop: '',
    khoa: '',
    khoa_hoc: ''
  });
  const [lopSuggestions, setLopSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const danhSachLop = [
    'DA22TTA', 'DA22TTB', 'DA22TTC', 'DA22TTD', 'DA22XDA', 'DA22XDB', 'DA22CNOTA', 'DA22CNOTB', 'DA22CNOTC',
    'DA23TTA', 'DA23TTB', 'DA23TTC', 'DA23TTD', 'DA23XDA', 'DA23XDB', 'DA23CNOTA', 'DA23CNOTB', 'DA23CNOTC',
    'DA24TTA', 'DA24TTB', 'DA24TTC', 'DA24TTD', 'DA24XDA', 'DA24XDB', 'DA24CNOTA', 'DA24CNOTB', 'DA24CNOTC',
    'DA25TTA', 'DA25TTB', 'DA25TTC', 'DA25TTD', 'DA25XDA', 'DA25XDB', 'DA25CNOTA', 'DA25CNOTB', 'DA25CNOTC'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.data);
      setFormData({
        ho_ten: response.data.ho_ten || '',
        lop: response.data.lop || '',
        khoa: response.data.khoa || '',
        khoa_hoc: response.data.khoa_hoc || ''
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await sinhvienService.updateProfile({
        ho_ten: formData.ho_ten,
        lop: formData.lop,
        khoa: formData.khoa,
        khoa_hoc: formData.khoa_hoc
      });
      alert('Cập nhật hồ sơ thành công!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể cập nhật'));
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="profile-container">
      <h1>Hồ sơ cá nhân</h1>

      <div className="profile-card card">
        <div className="profile-avatar-section">
          <img src="/default-avatar.png" alt="Avatar" className="profile-avatar" />
          <p className="avatar-label">Avatar mặc định</p>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                className="form-control"
                value={formData.ho_ten}
                onChange={(e) => setFormData({...formData, ho_ten: e.target.value})}
                required
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label>Lớp</label>
              <input
                type="text"
                className="form-control"
                value={formData.lop}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({...formData, lop: value});
                  if (value.length > 0) {
                    const filtered = danhSachLop.filter(lop => 
                      lop.toLowerCase().includes(value.toLowerCase())
                    );
                    setLopSuggestions(filtered);
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => setShowSuggestions(formData.lop.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="VD: DA22TTA, DA23TTB..."
                required
              />
              {showSuggestions && lopSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                  {lopSuggestions.map((lop, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setFormData({ ...formData, lop });
                        setShowSuggestions(false);
                      }}
                      style={{
                        padding: '10px 15px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      {lop}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Khoa</label>
              <select
                className="form-control"
                value={formData.khoa}
                onChange={(e) => setFormData({...formData, khoa: e.target.value})}
                required
              >
                <option value="">-- Chọn khoa --</option>
                <option value="Khoa Công Nghệ Thông Tin">Khoa Công Nghệ Thông Tin</option>
                <option value="Khoa Công Nghệ Ôtô">Khoa Công Nghệ Ôtô</option>
                <option value="Khoa Xây Dựng">Khoa Xây Dựng</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label>Khóa</label>
              <select
                className="form-control"
                value={formData.khoa_hoc}
                onChange={(e) => setFormData({...formData, khoa_hoc: e.target.value})}
                required
              >
                <option value="">-- Chọn khóa --</option>
                <option value="22">Khóa 22</option>
                <option value="23">Khóa 23</option>
                <option value="24">Khóa 24</option>
                <option value="25">Khóa 25</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Lưu</button>
              <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-item">
              <strong>Họ và tên:</strong>
              <span>{user.ho_ten}</span>
            </div>
            <div className="info-item">
              <strong>Mã sinh viên:</strong>
              <span>{user.ma_sinh_vien}</span>
            </div>
            <div className="info-item">
              <strong>Email:</strong>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <strong>Lớp:</strong>
              <span>{user.lop}</span>
            </div>
            <div className="info-item">
              <strong>Khoa:</strong>
              <span>{user.khoa}</span>
            </div>
            <div className="info-item">
              <strong>Khóa:</strong>
              <span>{user.khoa_hoc ? `Khóa ${user.khoa_hoc}` : 'Chưa cập nhật'}</span>
            </div>
            <button onClick={() => setEditing(true)} className="btn btn-primary mt-3">
              Chỉnh sửa
            </button>
          </div>
        )}
      </div>

      <style>{`
        .profile-card {
          max-width: 600px;
          margin: 0 auto;
        }

        .profile-avatar-section {
          text-align: center;
          padding: 30px;
          border-bottom: 1px solid #eee;
        }

        .profile-avatar {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #1976d2;
        }

        .avatar-label {
          margin-top: 10px;
          color: #1976d2;
          font-weight: 500;
          font-size: 14px;
        }

        .profile-avatar-placeholder {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: #f0f0f0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 4px solid #ddd;
        }

        .profile-info {
          padding: 30px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-item strong {
          color: #666;
        }

        .info-item span {
          color: #333;
          font-weight: 500;
        }

        .profile-form {
          padding: 30px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default Profile;
