import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import './CreateProfile.css';

const CreateProfile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    ho_ten: '',
    ma_sinh_vien: '',
    lop: '',
    khoa: '',
    khoa_hoc: ''
  });
  const [lopSuggestions, setLopSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [anhDaiDien, setAnhDaiDien] = useState(null);
  const [preview, setPreview] = useState(null);

  // Danh sách lớp theo khóa
  const danhSachLop = [
    // Khóa 22
    'DA22TTA', 'DA22TTB', 'DA22TTC', 'DA22TTD',
    'DA22XDA', 'DA22XDB',
    'DA22CNOTA', 'DA22CNOTB', 'DA22CNOTC',
    // Khóa 23
    'DA23TTA', 'DA23TTB', 'DA23TTC', 'DA23TTD',
    'DA23XDA', 'DA23XDB',
    'DA23CNOTA', 'DA23CNOTB', 'DA23CNOTC',
    // Khóa 24
    'DA24TTA', 'DA24TTB', 'DA24TTC', 'DA24TTD',
    'DA24XDA', 'DA24XDB',
    'DA24CNOTA', 'DA24CNOTB', 'DA24CNOTC',
    // Khóa 25
    'DA25TTA', 'DA25TTB', 'DA25TTC', 'DA25TTD',
    'DA25XDA', 'DA25XDB',
    'DA25CNOTA', 'DA25CNOTB', 'DA25CNOTC'
  ];

  useEffect(() => {
    const token = searchParams.get('token');
    const status = searchParams.get('status');

    if (token) {
      localStorage.setItem('token', token);
      
      if (status === 'da_duyet') {
        navigate('/sinhvien');
      } else if (status === 'cho_duyet') {
        navigate('/waiting-approval');
      }
    }

    // Lấy thông tin user
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        setUser(response.data);
        
        if (response.data.trang_thai !== 'chua_hoan_thanh') {
          navigate('/sinhvien');
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [searchParams, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Tự động gợi ý lớp khi nhập
    if (name === 'lop' && value.length > 0) {
      const filtered = danhSachLop.filter(lop => 
        lop.toLowerCase().includes(value.toLowerCase())
      );
      setLopSuggestions(filtered);
      setShowSuggestions(true);
    } else if (name === 'lop') {
      setShowSuggestions(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAnhDaiDien(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('nguoi_dung_id', user.id);
      data.append('ho_ten', formData.ho_ten);
      data.append('ma_sinh_vien', formData.ma_sinh_vien);
      data.append('lop', formData.lop);
      data.append('khoa', formData.khoa);
      data.append('khoa_hoc', formData.khoa_hoc);
      
      if (anhDaiDien) {
        data.append('anh_dai_dien', anhDaiDien);
      }

      await authService.createProfile(data);
      navigate('/waiting-approval');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tạo hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="create-profile-container">
      <div className="profile-box">
        <div className="profile-header">
          <h1>Tạo hồ sơ sinh viên</h1>
          <p>Vui lòng điền đầy đủ thông tin để hoàn tất đăng ký</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="avatar-upload">
            <div className="avatar-preview">
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <div className="avatar-placeholder">
                  <span>Chọn ảnh</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              id="avatar-input"
            />
            <label htmlFor="avatar-input" className="btn btn-secondary">
              Tải ảnh đại diện
            </label>
          </div>

          <div className="form-group">
            <label>Họ và tên *</label>
            <input
              type="text"
              name="ho_ten"
              className="form-control"
              value={formData.ho_ten}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mã số sinh viên *</label>
            <input
              type="text"
              name="ma_sinh_vien"
              className="form-control"
              value={formData.ma_sinh_vien}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label>Lớp *</label>
            <input
              type="text"
              name="lop"
              className="form-control"
              value={formData.lop}
              onChange={handleChange}
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
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background 0.2s'
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
            <label>Khoa *</label>
            <select
              name="khoa"
              className="form-control"
              value={formData.khoa}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn khoa --</option>
              <option value="Kỹ thuật và Công nghệ">Kỹ thuật và Công nghệ</option>
              <option value="Kinh tế">Kinh tế</option>
              <option value="Nông nghiệp">Nông nghiệp</option>
              <option value="Sư phạm">Sư phạm</option>
            </select>
          </div>

          <div className="form-group">
            <label>Khóa *</label>
            <select
              name="khoa_hoc"
              className="form-control"
              value={formData.khoa_hoc}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn khóa --</option>
              <option value="22">Khóa 22</option>
              <option value="23">Khóa 23</option>
              <option value="24">Khóa 24</option>
              <option value="25">Khóa 25</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;
