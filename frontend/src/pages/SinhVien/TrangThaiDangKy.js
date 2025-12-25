import React, { useState, useEffect } from 'react';
import { sinhvienService } from '../../services/api';
import Loading from '../../components/Loading';
import { FaClock, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import './TrangThaiDangKy.css';

const TrangThaiDangKy = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await sinhvienService.getMyActivities();
      setRegistrations(response.data);
    } catch (error) {
      console.error('Fetch registrations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'cho_duyet': {
        icon: <FaClock className="status-icon pending" />,
        text: 'Đang chờ duyệt',
        class: 'pending',
        description: 'Đơn đăng ký của bạn đang được xem xét bởi chủ nhiệm CLB'
      },
      'da_duyet': {
        icon: <FaCheckCircle className="status-icon approved" />,
        text: 'Đã được duyệt',
        class: 'approved',
        description: 'Chúc mừng! Bạn đã được chấp nhận tham gia hoạt động này'
      },
      'tu_choi': {
        icon: <FaTimesCircle className="status-icon rejected" />,
        text: 'Bị từ chối',
        class: 'rejected',
        description: 'Rất tiếc, đơn đăng ký của bạn không được chấp nhận'
      },
      'da_huy': {
        icon: <FaTimesCircle className="status-icon cancelled" />,
        text: 'Đã hủy',
        class: 'cancelled',
        description: 'Bạn đã hủy đăng ký hoạt động này'
      }
    };
    return statusMap[status] || statusMap['cho_duyet'];
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true;
    return reg.trang_thai_dang_ky === filter;
  });

  const getStats = () => {
    return {
      total: registrations.length,
      pending: registrations.filter(r => r.trang_thai_dang_ky === 'cho_duyet').length,
      approved: registrations.filter(r => r.trang_thai_dang_ky === 'da_duyet').length,
      rejected: registrations.filter(r => r.trang_thai_dang_ky === 'tu_choi').length
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loading />;

  const stats = getStats();

  return (
    <div className="trang-thai-dang-ky">
      <div className="page-header">
        <h1>Trạng thái đăng ký hoạt động</h1>
        <p>Theo dõi tình trạng các đơn đăng ký tham gia hoạt động của bạn</p>
      </div>

      <div className="stats-overview">
        <div className="stat-box total" onClick={() => setFilter('all')}>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Tổng đăng ký</div>
        </div>
        <div className="stat-box pending" onClick={() => setFilter('cho_duyet')}>
          <FaClock className="stat-icon" />
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Chờ duyệt</div>
        </div>
        <div className="stat-box approved" onClick={() => setFilter('da_duyet')}>
          <FaCheckCircle className="stat-icon" />
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Đã duyệt</div>
        </div>
        <div className="stat-box rejected" onClick={() => setFilter('tu_choi')}>
          <FaTimesCircle className="stat-icon" />
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Từ chối</div>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả ({stats.total})
        </button>
        <button 
          className={`filter-tab ${filter === 'cho_duyet' ? 'active' : ''}`}
          onClick={() => setFilter('cho_duyet')}
        >
          Chờ duyệt ({stats.pending})
        </button>
        <button 
          className={`filter-tab ${filter === 'da_duyet' ? 'active' : ''}`}
          onClick={() => setFilter('da_duyet')}
        >
          Đã duyệt ({stats.approved})
        </button>
        <button 
          className={`filter-tab ${filter === 'tu_choi' ? 'active' : ''}`}
          onClick={() => setFilter('tu_choi')}
        >
          Từ chối ({stats.rejected})
        </button>
      </div>

      {filteredRegistrations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Không có đăng ký nào</h3>
          <p>
            {filter === 'all' 
              ? 'Bạn chưa đăng ký tham gia hoạt động nào.' 
              : `Không có đăng ký nào ở trạng thái "${getStatusInfo(filter).text}".`}
          </p>
        </div>
      ) : (
        <div className="registrations-list">
          {filteredRegistrations.map(reg => {
            const statusInfo = getStatusInfo(reg.trang_thai_dang_ky);
            return (
              <div key={reg.dang_ky_id || reg.hoat_dong_id} className={`registration-card ${statusInfo.class}`}>
                <div className="card-header">
                  <div className="status-badge-large">
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                  </div>
                  <span className="clb-tag">{reg.ten_clb}</span>
                </div>

                <div className="card-body">
                  <h3 className="activity-name">{reg.ten_hoat_dong}</h3>
                  <p className="status-description">{statusInfo.description}</p>

                  <div className="activity-details">
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span>{formatDate(reg.thoi_gian_bat_dau)}</span>
                    </div>
                    <div className="detail-item">
                      <FaMapMarkerAlt />
                      <span>{reg.dia_diem}</span>
                    </div>
                  </div>

                  {reg.ghi_chu && (
                    <div className="note-section">
                      <strong>Ghi chú của bạn:</strong>
                      <p>{reg.ghi_chu}</p>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <span className="register-date">
                    Đăng ký lúc: {formatDate(reg.ngay_dang_ky)}
                  </span>
                  {reg.ngay_duyet && (
                    <span className="approve-date">
                      {reg.trang_thai_dang_ky === 'da_duyet' ? 'Duyệt' : 'Xử lý'} lúc: {formatDate(reg.ngay_duyet)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrangThaiDangKy;
