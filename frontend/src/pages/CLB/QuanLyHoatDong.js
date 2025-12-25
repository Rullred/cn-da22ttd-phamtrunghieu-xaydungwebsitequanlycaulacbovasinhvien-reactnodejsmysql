import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clbService } from '../../services/api';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaInfoCircle, FaTrash, FaEye, FaCheckCircle } from 'react-icons/fa';
import Loading from '../../components/Loading';

const QuanLyHoatDong = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Format datetime cho timezone Việt Nam
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa có';
    try {
      // Xử lý nhiều format: "2025-11-02 07:30:00" hoặc "2025-11-02T07:30:00"
      let dateStr = dateString;
      if (dateStr.includes(' ')) {
        dateStr = dateStr.replace(' ', 'T');
      }
      
      const date = new Date(dateStr);
      
      // Kiểm tra date hợp lệ
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    try {
      let dateStr = dateString;
      if (dateStr.includes(' ')) {
        dateStr = dateStr.split(' ')[0];
      }
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      let dateStr = dateString;
      if (dateStr.includes(' ')) {
        dateStr = dateStr.replace(' ', 'T');
      }
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    } catch (error) {
      return '';
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await clbService.getActivities();
      setActivities(response.data);
    } catch (error) {
      console.error('Fetch activities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa hoạt động này?')) return;

    try {
      await clbService.deleteActivity(id);
      alert('Xóa hoạt động thành công!');
      fetchActivities();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xóa'));
    }
  };

  const viewRegistrations = (id) => {
    navigate(`/caulacbo/danh-sach-dang-ky/${id}`);
  };

  const showDetail = (activity) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };

  const closeDetail = () => {
    setShowDetailModal(false);
    setSelectedActivity(null);
  };

  if (loading) return <Loading />;

  return (
    <div className="quan-ly-hoat-dong-container">
      <div className="page-header">
        <h1>Quản lý Hoạt động</h1>
        <div className="activity-count">
          <FaCheckCircle /> {activities.length} hoạt động
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="empty-state">
          <FaCalendarAlt />
          <p>Chưa có hoạt động nào</p>
        </div>
      ) : (
        <div className="activities-grid">
          {activities.map(activity => (
            <div key={activity.id} className="activity-card">
              <div className="card-header">
                <div className="header-icon">
                  <FaCalendarAlt />
                </div>
                <div className="header-content">
                  <h3>{activity.ten_hoat_dong}</h3>
                  <span className={`status-badge status-${activity.trang_thai_duyet || 'cho_duyet'}`}>
                    {activity.trang_thai_duyet === 'da_duyet' ? 'Đã duyệt' : 
                     activity.trang_thai_duyet === 'tu_choi' ? 'Từ chối' : 'Chờ duyệt'}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <FaCalendarAlt className="icon-time" />
                  <div>
                    <div className="info-label">Ngày tổ chức</div>
                    <div className="info-value">{formatDate(activity.thoi_gian_bat_dau)}</div>
                  </div>
                </div>

                <div className="info-row">
                  <FaClock className="icon-time" />
                  <div>
                    <div className="info-label">Thời gian</div>
                    <div className="info-value">
                      {formatTime(activity.thoi_gian_bat_dau)} - {formatTime(activity.thoi_gian_ket_thuc)}
                    </div>
                  </div>
                </div>

                <div className="info-row">
                  <FaMapMarkerAlt className="icon-location" />
                  <div>
                    <div className="info-label">Địa điểm</div>
                    <div className="info-value">{activity.dia_diem}</div>
                  </div>
                </div>

                <div className="info-row">
                  <FaUsers className="icon-users" />
                  <div>
                    <div className="info-label">Thống kê đăng ký</div>
                    <div className="info-value" style={{fontSize: '13px'}}>
                      <div style={{marginBottom: '4px'}}>
                        <strong>Tổng:</strong> {activity.tong_so_dang_ky || 0} / {activity.so_luong_toi_da > 0 ? activity.so_luong_toi_da + ' người' : 'Không giới hạn'}
                      </div>
                      <div style={{display: 'flex', gap: '12px', fontSize: '12px', color: '#666'}}>
                        <span>Chờ duyệt: {activity.so_cho_duyet || 0}</span>
                        <span>Tham gia: {activity.so_dang_tham_gia || 0}</span>
                        <span>Hoàn thành: {activity.so_hoan_thanh || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="info-row">
                  <FaInfoCircle className="icon-info" />
                  <div>
                    <div className="info-label">Loại hoạt động</div>
                    <div className="info-value">
                      {activity.loai_hoat_dong === 'chung' ? 'Chung' : 'Chung'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button className="btn-detail" onClick={() => showDetail(activity)}>
                  <FaInfoCircle /> Chi tiết
                </button>
                <button className="btn-view" onClick={() => navigate(`/caulacbo/duyet-tham-gia/${activity.id}`)}>
                  <FaEye /> Quản lý duyệt
                </button>
                <button className="btn-delete" onClick={() => handleDelete(activity.id)}>
                  <FaTrash /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal chi tiết */}
      {showDetailModal && selectedActivity && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedActivity.ten_hoat_dong}</h2>
              <button className="modal-close" onClick={closeDetail}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <FaCalendarAlt className="detail-icon" />
                <div>
                  <strong>Ngày tổ chức:</strong> {formatDateTime(selectedActivity.thoi_gian_bat_dau)}
                </div>
              </div>
              <div className="detail-row">
                <FaClock className="detail-icon" />
                <div>
                  <strong>Thời gian:</strong> {formatDateTime(selectedActivity.thoi_gian_bat_dau)} - {formatDateTime(selectedActivity.thoi_gian_ket_thuc)}
                </div>
              </div>
              <div className="detail-row">
                <FaMapMarkerAlt className="detail-icon" />
                <div>
                  <strong>Địa điểm:</strong> {selectedActivity.dia_diem}
                </div>
              </div>
              <div className="detail-row">
                <FaUsers className="detail-icon" />
                <div>
                  <strong>Số lượng tối đa:</strong> {selectedActivity.so_luong_toi_da > 0 ? selectedActivity.so_luong_toi_da + ' người' : 'Không giới hạn'}
                </div>
              </div>
              {selectedActivity.quy_dinh_trang_phuc && (
                <div className="detail-row">
                  <FaInfoCircle className="detail-icon" />
                  <div>
                    <strong>Trang phục:</strong> {selectedActivity.quy_dinh_trang_phuc}
                  </div>
                </div>
              )}
              {selectedActivity.mo_ta && (
                <div className="detail-section">
                  <strong>Mô tả:</strong>
                  <p className="description">{selectedActivity.mo_ta}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .quan-ly-hoat-dong-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #e2e8f0;
        }

        .page-header h1 {
          color: #2d3748;
          margin: 0;
          font-size: 28px;
        }

        .activity-count {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 20px;
          font-weight: 600;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .empty-state svg {
          font-size: 64px;
          color: #cbd5e0;
          margin-bottom: 16px;
        }

        .activities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
          gap: 24px;
        }

        .activity-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .activity-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          display: flex;
          gap: 16px;
          color: white;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .header-content {
          flex: 1;
        }

        .header-content h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 700;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(255,255,255,0.2);
        }

        .status-da_duyet {
          background: rgba(72, 187, 120, 0.2);
          color: #22543d;
        }

        .status-cho_duyet {
          background: rgba(237, 137, 54, 0.2);
          color: #7c2d12;
        }

        .status-tu_choi {
          background: rgba(245, 101, 101, 0.2);
          color: #742a2a;
        }

        .card-body {
          padding: 20px;
        }

        .info-row {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row svg {
          font-size: 20px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .icon-time {
          color: #f093fb;
        }

        .icon-location {
          color: #4facfe;
        }

        .icon-users {
          color: #fa709a;
        }

        .icon-info {
          color: #667eea;
        }

        .info-label {
          font-size: 12px;
          color: #718096;
          margin-bottom: 2px;
        }

        .info-value {
          font-size: 14px;
          color: #2d3748;
          font-weight: 600;
        }

        .card-actions {
          padding: 16px 20px;
          background: #f7fafc;
          display: flex;
          gap: 8px;
        }

        .card-actions button {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .btn-detail {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-detail:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-view {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .btn-view:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
        }

        .btn-delete {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .btn-delete:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .modal-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .modal-close {
          background: none;
          border: none;
          color: white;
          font-size: 32px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .modal-close:hover {
          background: rgba(255,255,255,0.2);
        }

        .modal-body {
          padding: 24px;
        }

        .detail-row {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-icon {
          font-size: 20px;
          color: #667eea;
          margin-top: 2px;
        }

        .detail-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 2px solid #e2e8f0;
        }

        .detail-section strong {
          display: block;
          margin-bottom: 8px;
          color: #2d3748;
        }

        .description {
          color: #4a5568;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        @media (max-width: 768px) {
          .activities-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default QuanLyHoatDong;
