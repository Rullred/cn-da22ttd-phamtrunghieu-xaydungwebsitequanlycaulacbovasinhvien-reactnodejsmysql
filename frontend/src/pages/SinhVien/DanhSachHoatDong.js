import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sinhvienService } from '../../services/api';
import Loading from '../../components/Loading';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaTshirt, FaClock, FaBullseye, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import './DanhSachHoatDong.css';

const DanhSachHoatDong = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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

  const handleRegister = async (id, isReRegister = false) => {
    const ghi_chu = window.prompt('📝 Ghi chú cho hoạt động này (có thể bỏ trống):');
    
    if (ghi_chu === null) return; // User cancelled
    
    try {
      await sinhvienService.registerActivity(id, ghi_chu || '');
      setMessage(isReRegister 
        ? '✅ Đăng ký lại thành công! Vui lòng chờ CLB phê duyệt.' 
        : '✅ Đăng ký thành công! Vui lòng chờ CLB phê duyệt.'
      );
      setTimeout(() => setMessage(''), 4000);
      fetchActivities();
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || 'Không thể đăng ký'));
    }
  };

  const getRegistrationStatus = (activity) => {
    if (!activity.trang_thai_dang_ky) {
      // Chưa đăng ký
      return {
        text: '✅ Đăng ký tham gia',
        color: '#3498db',
        canRegister: true,
        icon: null
      };
    }

    switch (activity.trang_thai_dang_ky) {
      case 'cho_duyet':
        return {
          text: '⏳ Đang chờ duyệt',
          color: '#f39c12',
          canRegister: false,
          icon: FaClock
        };
      case 'da_duyet':
      case 'dang_tham_gia':
      case 'hoan_thanh':
        return {
          text: '✅ Đã được duyệt',
          color: '#27ae60',
          canRegister: false,
          icon: FaCheckCircle
        };
      case 'tu_choi':
        return {
          text: '❌ Đã bị từ chối - Đăng ký lại',
          color: '#e74c3c',
          canRegister: true,
          icon: null,
          isReRegister: true
        };
      case 'da_huy':
        return {
          text: '🔄 Đã hủy - Đăng ký lại',
          color: '#95a5a6',
          canRegister: true,
          icon: null,
          isReRegister: true
        };
      default:
        return {
          text: '✅ Đăng ký tham gia',
          color: '#3498db',
          canRegister: true,
          icon: null
        };
    }
  };

  const handleViewActivity = (activityId) => {
    navigate(`/sinhvien/hoat-dong/${activityId}`);
  };

  const getMucDichText = (muc_dich) => {
    const mucDichMap = {
      've_nguon': 'Về nguồn',
      'van_nghe': 'Văn nghệ',
      've_sinh': 'Vệ sinh',
      'ho_tro': 'Hỗ trợ',
      'cuoc_thi': 'Cuộc thi',
      'toa_dam': 'Tọa đàm',
      'the_thao': 'Thể thao',
      'tinh_nguyen': 'Tình nguyện',
      'hoi_thao': 'Hội thảo',
      'khac': 'Khác'
    };
    return mucDichMap[muc_dich] || 'Chưa xác định';
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
                  <p>{activity.mo_ta || 'Không có mô tả'}</p>
                  
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

                    {activity.muc_dich && (
                      <div className="detail-item">
                        <FaBullseye />
                        <span>
                          <strong>Mục đích</strong>
                          {getMucDichText(activity.muc_dich)}
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

                    {activity.trang_thai_dang_ky && (
                      <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                        <FaInfoCircle style={{ 
                          color: getRegistrationStatus(activity).color 
                        }} />
                        <span style={{ 
                          color: getRegistrationStatus(activity).color, 
                          fontWeight: 'bold' 
                        }}>
                          {activity.trang_thai_dang_ky === 'cho_duyet' && '⏳ Đang chờ CLB duyệt'}
                          {activity.trang_thai_dang_ky === 'da_duyet' && '✅ Đã được CLB duyệt'}
                          {activity.trang_thai_dang_ky === 'tu_choi' && '❌ Đã bị từ chối đăng ký'}
                          {activity.trang_thai_dang_ky === 'da_huy' && '🔄 Đã hủy đăng ký'}
                          {activity.trang_thai_dang_ky === 'dang_tham_gia' && '✅ Đang tham gia'}
                          {activity.trang_thai_dang_ky === 'hoan_thanh' && '✅ Đã hoàn thành'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="activity-footer">
                  {(() => {
                    const status = getRegistrationStatus(activity);
                    const StatusIcon = status.icon;
                    
                    if (!status.canRegister) {
                      return (
                        <button 
                          onClick={() => handleViewActivity(activity.id)} 
                          className="btn btn-success"
                          style={{ 
                            background: `linear-gradient(135deg, ${status.color} 0%, ${status.color}dd 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          {StatusIcon && <StatusIcon />}
                          {status.text}
                        </button>
                      );
                    }
                    
                    return (
                      <button 
                        onClick={() => handleRegister(activity.id, status.isReRegister)} 
                        className="btn btn-primary"
                        style={status.isReRegister ? {
                          background: `linear-gradient(135deg, ${status.color} 0%, ${status.color}dd 100%)`
                        } : {}}
                        disabled={
                          activity.so_luong_toi_da > 0 && 
                          activity.so_luong_da_dang_ky >= activity.so_luong_toi_da
                        }
                      >
                        {activity.so_luong_toi_da > 0 && activity.so_luong_da_dang_ky >= activity.so_luong_toi_da
                          ? '❌ Đã đủ số lượng'
                          : status.text
                        }
                      </button>
                    );
                  })()}
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
