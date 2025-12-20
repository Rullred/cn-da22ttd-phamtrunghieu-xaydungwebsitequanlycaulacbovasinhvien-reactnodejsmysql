import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaTshirt, 
  FaUsers, 
  FaFileAlt, 
  FaBullhorn, 
  FaFlag,
  FaUniversity,
  FaCheckCircle,
  FaStar
} from 'react-icons/fa';
import './TaoHoatDong.css';

// Danh sách mục đích hoạt động với điểm gợi ý
const MUC_DICH_HOAT_DONG = [
  { value: 've_nguon', label: 'Về nguồn', icon: '🏛️', diemGoiY: 2 },
  { value: 'van_nghe', label: 'Chương trình Văn nghệ', icon: '🎭', diemGoiY: 2 },
  { value: 've_sinh', label: 'Vệ sinh', icon: '🧹', diemGoiY: 2 },
  { value: 'ho_tro', label: 'Hỗ trợ', icon: '🤝', diemGoiY: 2 },
  { value: 'cuoc_thi', label: 'Cuộc thi', icon: '🏆', diemGoiY: 3 },
  { value: 'toa_dam', label: 'Tọa đàm', icon: '💬', diemGoiY: 4 },
  { value: 'the_thao', label: 'Thể thao', icon: '⚽', diemGoiY: 3 },
  { value: 'tinh_nguyen', label: 'Tình nguyện', icon: '💚', diemGoiY: 3 },
  { value: 'hoi_thao', label: 'Hội thảo', icon: '📚', diemGoiY: 4 },
  { value: 'khac', label: 'Khác', icon: '📌', diemGoiY: 1 }
];

const TaoHoatDong = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ten_hoat_dong: '',
    mo_ta: '',
    ngay_to_chuc: '',
    gio_bat_dau: '',
    gio_ket_thuc: '',
    dia_diem: '',
    quy_dinh_trang_phuc: '',
    so_luong_toi_da: 0,
    muc_dich: '',
    don_vi_phu_trach: 'Đoàn trường Kỹ thuật và Công nghệ TVU',
    diem_ren_luyen: 0
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'gio_ket_thuc' && formData.gio_bat_dau) {
      if (value <= formData.gio_bat_dau) {
        alert('Giờ kết thúc phải sau giờ bắt đầu!');
        return;
      }
    }

    // Tự động gợi ý điểm rèn luyện khi chọn mục đích
    if (name === 'muc_dich') {
      const mucDich = MUC_DICH_HOAT_DONG.find(m => m.value === value);
      setFormData({
        ...formData,
        [name]: value,
        diem_ren_luyen: mucDich?.diemGoiY || 0
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.don_vi_phu_trach) {
      alert('Vui lòng nhập đơn vị phụ trách!');
      return;
    }

    if (!formData.ngay_to_chuc || !formData.gio_bat_dau || !formData.gio_ket_thuc) {
      alert('Vui lòng điền đầy đủ ngày và giờ tổ chức!');
      return;
    }

    if (formData.gio_ket_thuc <= formData.gio_bat_dau) {
      alert('Giờ kết thúc phải sau giờ bắt đầu!');
      return;
    }

    const thoi_gian_bat_dau = `${formData.ngay_to_chuc} ${formData.gio_bat_dau}:00`;
    const thoi_gian_ket_thuc = `${formData.ngay_to_chuc} ${formData.gio_ket_thuc}:00`;

    const dataToSend = {
      ...formData,
      thoi_gian_bat_dau,
      thoi_gian_ket_thuc
    };

    setLoading(true);
    try {
      await adminService.createActivity(dataToSend);
      alert('Tạo hoạt động thành công! Hoạt động đã được tự động phê duyệt.');
      navigate('/admin');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể tạo hoạt động'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-tao-hoat-dong-container">
      <div className="activity-form-card">
        {/* Header */}
        <div className="form-header">
          <div className="header-icon">
            <FaBullhorn />
          </div>
          <div className="header-content">
            <h2>Tạo hoạt động mới</h2>
            <p className="header-note">
              <FaCheckCircle /> Hoạt động sẽ được tự động phê duyệt
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="activity-form">
          {/* Tên hoạt động */}
          <div className="form-item">
            <div className="item-icon">
              <FaFileAlt />
            </div>
            <div className="item-content">
              <label className="item-label">Tên hoạt động *</label>
              <input
                type="text"
                name="ten_hoat_dong"
                className="form-input"
                value={formData.ten_hoat_dong}
                onChange={handleChange}
                placeholder='VD: "THỨ 7 TÌNH NGUYỆN, CHỦ NHẬT XANH"'
                required
              />
            </div>
          </div>

          {/* Đơn vị phụ trách */}
          <div className="form-item">
            <div className="item-icon clb">
              <FaUniversity />
            </div>
            <div className="item-content">
              <label className="item-label">Đơn vị phụ trách *</label>
              <input
                type="text"
                name="don_vi_phu_trach"
                className="form-input"
                value={formData.don_vi_phu_trach}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Mục đích hoạt động */}
          <div className="form-item">
            <div className="item-icon purpose">
              <FaFlag />
            </div>
            <div className="item-content">
              <label className="item-label">Mục đích hoạt động *</label>
              <select
                name="muc_dich"
                className="form-input form-select"
                value={formData.muc_dich}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn mục đích hoạt động --</option>
                {MUC_DICH_HOAT_DONG.map(item => (
                  <option key={item.value} value={item.value}>
                    {item.icon} {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ngày tổ chức */}
          <div className="form-item">
            <div className="item-icon warning">
              <FaCalendarAlt />
            </div>
            <div className="item-content">
              <label className="item-label">Ngày tổ chức *</label>
              <input
                type="date"
                name="ngay_to_chuc"
                className="form-input"
                value={formData.ngay_to_chuc}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Giờ hoạt động */}
          <div className="form-item-row">
            <div className="form-item">
              <div className="item-icon warning">
                <FaClock />
              </div>
              <div className="item-content">
                <label className="item-label">Giờ bắt đầu *</label>
                <input
                  type="time"
                  name="gio_bat_dau"
                  className="form-input"
                  value={formData.gio_bat_dau}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-item">
              <div className="item-icon warning">
                <FaClock />
              </div>
              <div className="item-content">
                <label className="item-label">Giờ kết thúc *</label>
                <input
                  type="time"
                  name="gio_ket_thuc"
                  className="form-input"
                  value={formData.gio_ket_thuc}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Địa điểm */}
          <div className="form-item">
            <div className="item-icon location">
              <FaMapMarkerAlt />
            </div>
            <div className="item-content">
              <label className="item-label">Địa điểm *</label>
              <input
                type="text"
                name="dia_diem"
                className="form-input"
                value={formData.dia_diem}
                onChange={handleChange}
                placeholder="VD: Giảng đường D5, Khu I – Trường Đại học Trà Vinh"
                required
              />
            </div>
          </div>

          {/* Trang phục */}
          <div className="form-item">
            <div className="item-icon dress">
              <FaTshirt />
            </div>
            <div className="item-content">
              <label className="item-label">Trang phục</label>
              <input
                type="text"
                name="quy_dinh_trang_phuc"
                className="form-input"
                value={formData.quy_dinh_trang_phuc}
                onChange={handleChange}
                placeholder="VD: Áo Đoàn TN"
              />
            </div>
          </div>

          {/* Số lượng */}
          <div className="form-item">
            <div className="item-icon members">
              <FaUsers />
            </div>
            <div className="item-content">
              <label className="item-label">Số lượng tối đa (0 = không giới hạn)</label>
              <input
                type="number"
                name="so_luong_toi_da"
                className="form-input"
                value={formData.so_luong_toi_da}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          {/* Điểm rèn luyện */}
          <div className="form-item">
            <div className="item-icon score">
              <FaStar />
            </div>
            <div className="item-content">
              <label className="item-label">Điểm rèn luyện *</label>
              <input
                type="number"
                name="diem_ren_luyen"
                className="form-input"
                value={formData.diem_ren_luyen}
                onChange={handleChange}
                min="0"
                max="10"
                placeholder="VD: 2"
                required
              />
              <small className="input-hint">Điểm sẽ được cộng khi sinh viên hoàn thành hoạt động (0-10 điểm)</small>
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className="form-item">
            <div className="item-icon">
              <FaFileAlt />
            </div>
            <div className="item-content">
              <label className="item-label">Nội dung chi tiết</label>
              <textarea
                name="mo_ta"
                className="form-textarea"
                value={formData.mo_ta}
                onChange={handleChange}
                rows="5"
                placeholder="VD: Lập ds công điểm rèn luyện, nằm trong tiêu chí xét SV5T&#10;Xin trân trọng cảm ơn!"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button type="submit" className="btn btn-create" disabled={loading}>
              <FaBullhorn /> {loading ? 'Đang tạo...' : 'Tạo hoạt động'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/admin')} 
              className="btn btn-cancel"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaoHoatDong;
