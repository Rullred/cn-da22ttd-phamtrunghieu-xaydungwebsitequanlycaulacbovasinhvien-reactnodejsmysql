import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clbService } from '../../services/api';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTshirt, FaUsers, FaFileAlt, FaBullhorn } from 'react-icons/fa';

const TaoHoatDong = () => {
  const navigate = useNavigate();
  const [clbInfo, setClbInfo] = useState(null);
  const [formData, setFormData] = useState({
    ten_hoat_dong: '',
    mo_ta: '',
    ngay_to_chuc: '',
    gio_bat_dau: '',
    gio_ket_thuc: '',
    dia_diem: '',
    quy_dinh_trang_phuc: '',
    so_luong_toi_da: 0
  });

  useEffect(() => {
    fetchClbInfo();
  }, []);

  const fetchClbInfo = async () => {
    try {
      const response = await clbService.getMyClub();
      setClbInfo(response.data);
    } catch (error) {
      console.error('Lỗi lấy thông tin CLB:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation: Nếu thay đổi giờ kết thúc, kiểm tra phải sau giờ bắt đầu
    if (name === 'gio_ket_thuc' && formData.gio_bat_dau) {
      if (value <= formData.gio_bat_dau) {
        alert('Giờ kết thúc phải sau giờ bắt đầu!');
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.ngay_to_chuc || !formData.gio_bat_dau || !formData.gio_ket_thuc) {
      alert('Vui lòng điền đầy đủ ngày và giờ tổ chức!');
      return;
    }

    if (formData.gio_ket_thuc <= formData.gio_bat_dau) {
      alert('Giờ kết thúc phải sau giờ bắt đầu!');
      return;
    }

    // Ghép ngày + giờ thành datetime
    const thoi_gian_bat_dau = `${formData.ngay_to_chuc} ${formData.gio_bat_dau}:00`;
    const thoi_gian_ket_thuc = `${formData.ngay_to_chuc} ${formData.gio_ket_thuc}:00`;

    const dataToSend = {
      ...formData,
      thoi_gian_bat_dau,
      thoi_gian_ket_thuc
    };

    try {
      await clbService.createActivity(dataToSend);
      alert('Tạo hoạt động thành công!');
      navigate('/caulacbo/hoat-dong');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể tạo hoạt động'));
    }
  };

  return (
    <div className="tao-hoat-dong-container">
      <div className="activity-form-card">
        {/* Header với tên CLB */}
        <div className="form-header">
          <div className="header-icon">
            <FaBullhorn />
          </div>
          <div className="header-content">
            <h2>{clbInfo?.ten_clb || 'Đang tải...'}</h2>
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
            <button type="submit" className="btn btn-create">
              <FaBullhorn /> Tạo thông báo hoạt động
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/caulacbo/hoat-dong')} 
              className="btn btn-cancel"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .tao-hoat-dong-container {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }

        .activity-form-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 0;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
          overflow: hidden;
        }

        .form-header {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          color: white;
        }

        .header-icon {
          background: rgba(255, 255, 255, 0.3);
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .header-content h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.4;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .activity-form {
          background: white;
          padding: 32px;
        }

        .form-item {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          align-items: flex-start;
        }

        .form-item-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .item-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .item-icon.warning {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
        }

        .item-icon.location {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
        }

        .item-icon.dress {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);
        }

        .item-icon.members {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          box-shadow: 0 4px 12px rgba(250, 112, 154, 0.3);
        }

        .item-content {
          flex: 1;
        }

        .item-label {
          display: block;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #a0aec0;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid #e2e8f0;
        }

        .btn {
          padding: 14px 28px;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-create {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          flex: 1;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-create:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .btn-cancel {
          background: #e2e8f0;
          color: #4a5568;
        }

        .btn-cancel:hover {
          background: #cbd5e0;
        }

        @media (max-width: 768px) {
          .form-item-row {
            grid-template-columns: 1fr;
          }

          .header-content h2 {
            font-size: 16px;
          }

          .activity-form {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default TaoHoatDong;
