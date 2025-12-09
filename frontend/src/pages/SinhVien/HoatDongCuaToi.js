import React, { useState, useEffect } from 'react';
import { sinhvienService } from '../../services/api';
import Loading from '../../components/Loading';
import { FaCalendarCheck, FaClock, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import './HoatDongCuaToi.css';

const HoatDongCuaToi = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyActivities();
  }, []);

  const fetchMyActivities = async () => {
    try {
      const response = await sinhvienService.getMyActivities();
      setActivities(response.data);
    } catch (error) {
      console.error('Fetch my activities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy đăng ký?')) return;

    try {
      await sinhvienService.cancelRegistration(id);
      alert('Hủy đăng ký thành công');
      fetchMyActivities();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể hủy'));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'cho_duyet': { class: 'pending', text: 'Chờ duyệt', icon: <FaClock /> },
      'da_duyet': { class: 'approved', text: 'Đã duyệt', icon: <FaCheckCircle /> },
      'tu_choi': { class: 'rejected', text: 'Bị từ chối', icon: <FaTimesCircle /> },
      'da_huy': { class: 'cancelled', text: 'Đã hủy', icon: <FaTimesCircle /> }
    };
    const badge = badges[status] || { class: 'pending', text: status, icon: null };
    return (
      <span className={`status-badge ${badge.class}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const getActivityStats = () => {
    const total = activities.length;
    const approved = activities.filter(a => a.trang_thai_dang_ky === 'da_duyet').length;
    const pending = activities.filter(a => a.trang_thai_dang_ky === 'cho_duyet').length;
    const rejected = activities.filter(a => a.trang_thai_dang_ky === 'tu_choi').length;
    
    return { total, approved, pending, rejected };
  };

  if (loading) return <Loading />;

  const stats = getActivityStats();

  return (
    <div className="hoat-dong-cua-toi">
      <h1>Hoạt động của tôi</h1>

      {activities.length > 0 && (
        <div className="activity-stats">
          <div className="stat-card total">
            <h3>Tổng hoạt động</h3>
            <p className="number">{stats.total}</p>
          </div>
          <div className="stat-card approved">
            <h3>Đã duyệt</h3>
            <p className="number">{stats.approved}</p>
          </div>
          <div className="stat-card pending">
            <h3>Chờ duyệt</h3>
            <p className="number">{stats.pending}</p>
          </div>
          <div className="stat-card rejected">
            <h3>Bị từ chối</h3>
            <p className="number">{stats.rejected}</p>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>Chưa có hoạt động nào</h3>
          <p>Bạn chưa đăng ký tham gia hoạt động nào. Hãy khám phá các hoạt động thú vị!</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-header">
            <h2>Danh sách hoạt động đã đăng ký</h2>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Tên hoạt động</th>
                  <th>Câu lạc bộ</th>
                  <th>Thời gian</th>
                  <th>Địa điểm</th>
                  <th>Trạng thái</th>
                  <th>Ngày đăng ký</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(activity => (
                  <tr key={activity.id}>
                    <td>
                      <strong>{activity.ten_hoat_dong}</strong>
                    </td>
                    <td>
                      <span className="clb-badge">{activity.ten_clb}</span>
                    </td>
                    <td>
                      <div className="datetime-text">
                        <span className="date-main">
                          {new Date(activity.thoi_gian_bat_dau).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="time-sub">
                          {new Date(activity.thoi_gian_bat_dau).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td>{activity.dia_diem}</td>
                    <td>{getStatusBadge(activity.trang_thai_dang_ky)}</td>
                    <td>
                      {new Date(activity.ngay_dang_ky).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      {activity.trang_thai_dang_ky === 'cho_duyet' && (
                        <button 
                          onClick={() => handleCancel(activity.id)} 
                          className="btn-cancel"
                        >
                          Hủy
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoatDongCuaToi;
