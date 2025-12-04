import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUserCheck, FaUserTimes, FaArrowLeft, FaUser, FaIdCard, FaGraduationCap, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { clbService } from '../../services/api';
import './DanhSachDangKy.css';

function DanhSachDangKy() {
  const { hoatDongId } = useParams();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [activityInfo, setActivityInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, cho_duyet, da_duyet, tu_choi

  useEffect(() => {
    fetchRegistrations();
    fetchActivityInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoatDongId]);

  const fetchActivityInfo = async () => {
    try {
      const response = await clbService.getActivities();
      const activity = response.data.find(a => a.id === parseInt(hoatDongId));
      setActivityInfo(activity);
    } catch (error) {
      console.error('Lỗi lấy thông tin hoạt động:', error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await clbService.getActivityRegistrations(hoatDongId);
      console.log('Registrations response:', response.data);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Lỗi lấy danh sách đăng ký:', error);
      alert('Lỗi lấy danh sách: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId) => {
    if (!window.confirm('Bạn có chắc muốn phê duyệt đăng ký này?')) return;

    try {
      await clbService.approveRegistration(registrationId);
      alert('Phê duyệt thành công!');
      fetchRegistrations();
    } catch (error) {
      console.error('Lỗi phê duyệt:', error);
      alert('Lỗi phê duyệt: ' + error.message);
    }
  };

  const handleReject = async (registrationId) => {
    const lyDo = window.prompt('Nhập lý do từ chối (tùy chọn):');
    if (lyDo === null) return; // User clicked cancel

    try {
      await clbService.rejectRegistration(registrationId, lyDo);
      alert('Từ chối thành công!');
      fetchRegistrations();
    } catch (error) {
      console.error('Lỗi từ chối:', error);
      alert('Lỗi từ chối: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    try {
      let dateStr = dateString;
      if (dateStr.includes(' ')) {
        dateStr = dateStr.replace(' ', 'T');
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'cho_duyet':
        return <span className="status-badge pending">Chờ duyệt</span>;
      case 'da_duyet':
        return <span className="status-badge approved">Đã duyệt</span>;
      case 'tu_choi':
        return <span className="status-badge rejected">Từ chối</span>;
      case 'da_huy':
        return <span className="status-badge cancelled">Đã hủy</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true;
    return reg.trang_thai === filter;
  });

  const stats = {
    total: registrations.length,
    cho_duyet: registrations.filter(r => r.trang_thai === 'cho_duyet').length,
    da_duyet: registrations.filter(r => r.trang_thai === 'da_duyet').length,
    tu_choi: registrations.filter(r => r.trang_thai === 'tu_choi').length,
  };

  if (loading) {
    return <div className="loading-container">Đang tải...</div>;
  }

  return (
    <div className="danh-sach-dang-ky">
      <div className="header-section">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>
        
        {activityInfo && (
          <div className="activity-header">
            <h2>{activityInfo.ten_hoat_dong}</h2>
            <p className="activity-meta">
              <FaCalendarAlt /> {formatDate(activityInfo.thoi_gian_bat_dau)}
            </p>
          </div>
        )}
      </div>

      <div className="stats-section">
        <div className="stat-card total" onClick={() => setFilter('all')}>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Tổng đăng ký</div>
        </div>
        <div className="stat-card pending" onClick={() => setFilter('cho_duyet')}>
          <div className="stat-number">{stats.cho_duyet}</div>
          <div className="stat-label">Chờ duyệt</div>
        </div>
        <div className="stat-card approved" onClick={() => setFilter('da_duyet')}>
          <div className="stat-number">{stats.da_duyet}</div>
          <div className="stat-label">Đã duyệt</div>
        </div>
        <div className="stat-card rejected" onClick={() => setFilter('tu_choi')}>
          <div className="stat-number">{stats.tu_choi}</div>
          <div className="stat-label">Từ chối</div>
        </div>
      </div>

      {filteredRegistrations.length === 0 ? (
        <div className="no-registrations">
          <p>Chưa có đăng ký nào</p>
        </div>
      ) : (
        <div className="registrations-list">
          {filteredRegistrations.map((reg) => (
            <div key={reg.id} className="registration-card">
              <div className="student-info">
                <div className="avatar-section">
                  {reg.anh_dai_dien ? (
                    <img src={reg.anh_dai_dien} alt={reg.ho_ten} className="avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      <FaUser />
                    </div>
                  )}
                </div>
                
                <div className="details-section">
                  <h3 className="student-name">{reg.ho_ten}</h3>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <FaIdCard className="info-icon" />
                      <span>{reg.ma_sinh_vien}</span>
                    </div>
                    
                    <div className="info-item">
                      <FaGraduationCap className="info-icon" />
                      <span>{reg.lop}</span>
                    </div>
                    
                    <div className="info-item">
                      <FaCalendarAlt className="info-icon" />
                      <span>Đăng ký: {formatDate(reg.ngay_dang_ky)}</span>
                    </div>
                    
                    {reg.ngay_duyet && (
                      <div className="info-item">
                        <FaClock className="info-icon" />
                        <span>Duyệt: {formatDate(reg.ngay_duyet)}</span>
                      </div>
                    )}
                  </div>

                  {reg.ghi_chu && (
                    <div className="note-section">
                      <strong>Ghi chú:</strong> {reg.ghi_chu}
                    </div>
                  )}
                </div>

                <div className="status-section">
                  {getStatusBadge(reg.trang_thai)}
                </div>
              </div>

              {reg.trang_thai === 'cho_duyet' && (
                <div className="action-buttons">
                  <button 
                    className="btn-approve"
                    onClick={() => handleApprove(reg.id)}
                  >
                    <FaUserCheck /> Phê duyệt
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => handleReject(reg.id)}
                  >
                    <FaUserTimes /> Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DanhSachDangKy;
