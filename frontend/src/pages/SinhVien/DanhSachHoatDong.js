import React, { useState, useEffect } from 'react';
import { sinhvienService } from '../../services/api';
import Loading from '../../components/Loading';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaTshirt, FaClock } from 'react-icons/fa';
import './DanhSachHoatDong.css';

const DanhSachHoatDong = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await sinhvienService.getActivities();
      setActivities(response.data);
    } catch (error) {
      console.error('Fetch activities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (id) => {
    const ghi_chu = window.prompt('📝 Ghi chú cho hoạt động này (có thể bỏ trống):');
    
    if (ghi_chu === null) return; // User cancelled
    
    try {
      await sinhvienService.registerActivity(id, ghi_chu || '');
      setMessage('✅ Đăng ký thành công! Vui lòng chờ CLB phê duyệt.');
      setTimeout(() => setMessage(''), 4000);
      fetchActivities();
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || 'Không thể đăng ký'));
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="danh-sach-hoat-dong">
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '40px 30px',
        borderRadius: '20px',
        marginBottom: '30px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
      }}>
        <h1 style={{ 
          fontSize: '36px', 
          margin: '0 0 10px 0',
          color: 'white',
          background: 'none',
          WebkitTextFillColor: 'white'
        }}>
          Chào mừng đến với Hệ thống CLB & Hoạt động SV
        </h1>
        <p style={{ 
          margin: 0, 
          opacity: 0.95,
          fontSize: '16px'
        }}>
          Khám phá và tham gia các hoạt động thú vị!
        </p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      {activities.length === 0 ? (
        <div className="card text-center">
          <p style={{ fontSize: '18px', color: '#95a5a6' }}>
            📋 Chưa có hoạt động nào được tổ chức
          </p>
        </div>
      ) : (
        <>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '20px',
            color: '#2c3e50',
            fontWeight: '600'
          }}>
            Hoạt động sắp diễn ra
          </h2>
          <div className="activities-grid">
            {activities.map(activity => (
              <div key={activity.id} className="activity-card card">
                <div className="activity-header">
                  <h3>{activity.ten_hoat_dong}</h3>
                  <span className="badge badge-info">{activity.ten_clb}</span>
                </div>

                <div className="activity-body">
                  <p>{activity.mo_ta}</p>
                  
                  <div className="activity-details">
                    <div className="detail-item">
                      <FaCalendar />
                      <span>
                        <strong>Thời gian bắt đầu</strong>
                        {new Date(activity.thoi_gian_bat_dau).toLocaleString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="detail-item">
                      <FaClock />
                      <span>
                        <strong>Thời gian kết thúc</strong>
                        {new Date(activity.thoi_gian_ket_thuc).toLocaleString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="detail-item">
                      <FaMapMarkerAlt />
                      <span>
                        <strong>Địa điểm</strong>
                        {activity.dia_diem}
                      </span>
                    </div>

                    {activity.quy_dinh_trang_phuc && (
                      <div className="detail-item">
                        <FaTshirt />
                        <span>
                          <strong>Trang phục</strong>
                          {activity.quy_dinh_trang_phuc}
                        </span>
                      </div>
                    )}

                    <div className="detail-item">
                      <FaUsers />
                      <span>
                        <strong>Số lượng đăng ký</strong>
                        {activity.so_luong_da_dang_ky}/{activity.so_luong_toi_da > 0 ? activity.so_luong_toi_da : '∞'} người
                      </span>
                    </div>
                  </div>
                </div>

                <div className="activity-footer">
                  <button 
                    onClick={() => handleRegister(activity.id)} 
                    className="btn btn-primary"
                    disabled={
                      activity.so_luong_toi_da > 0 && 
                      activity.so_luong_da_dang_ky >= activity.so_luong_toi_da
                    }
                  >
                    {activity.so_luong_toi_da > 0 && activity.so_luong_da_dang_ky >= activity.so_luong_toi_da
                      ? '❌ Đã đủ số lượng'
                      : '✅ Đăng ký tham gia'
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DanhSachHoatDong;
