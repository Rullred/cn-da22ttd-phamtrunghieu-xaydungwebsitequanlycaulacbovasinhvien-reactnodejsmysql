import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sinhvienService } from '../../services/api';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaTshirt, 
  FaClock, 
  FaBullseye,
  FaUniversity,
  FaArrowLeft,
  FaCheckCircle,
  FaInfoCircle,
  FaStickyNote,
  FaTimesCircle
} from 'react-icons/fa';
import './ChiTietHoatDong.css';

const ChiTietHoatDong = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityDetail();
  }, [id]);

  const fetchActivityDetail = async () => {
    try {
      // Lấy thông tin hoạt động
      const activityResponse = await sinhvienService.getActivity(id);
      setActivity(activityResponse.data);

      // Lấy thông tin đăng ký của sinh viên
      const myActivitiesResponse = await sinhvienService.getMyActivities();
      const myRegistration = myActivitiesResponse.data.find(
        a => a.hoat_dong_id === parseInt(id)
      );
      setRegistration(myRegistration);
    } catch (error) {
      console.error('Fetch activity error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đăng ký hoạt động này?')) return;

    try {
      // Sử dụng hoat_dong_id chứ không phải dang_ky_id
      await sinhvienService.cancelRegistration(registration.hoat_dong_id);
      alert('✅ Hủy đăng ký thành công!');
      navigate('/sinhvien/hoat-dong');
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || 'Không thể hủy đăng ký'));
    }
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

  const getActivityStatusText = (trang_thai) => {
    const statusMap = {
      'sap_dien_ra': 'Sắp diễn ra',
      'dang_dien_ra': 'Đang diễn ra',
      'da_ket_thuc': 'Đã kết thúc',
      'huy': 'Đã hủy'
    };
    return statusMap[trang_thai] || trang_thai;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'cho_duyet': { variant: 'warning', text: 'Chờ CLB phê duyệt', icon: <FaClock /> },
      'da_duyet': { variant: 'success', text: 'Đã được duyệt', icon: <FaCheckCircle /> },
      'dang_tham_gia': { variant: 'success', text: 'Đang tham gia', icon: <FaCheckCircle /> },
      'tu_choi': { variant: 'danger', text: 'Bị từ chối', icon: <FaTimesCircle /> },
      'da_huy': { variant: 'secondary', text: 'Đã hủy', icon: <FaTimesCircle /> },
      'hoan_thanh': { variant: 'info', text: 'Hoàn thành', icon: <FaCheckCircle /> }
    };

    const status_info = statusMap[status] || { variant: 'secondary', text: status, icon: <FaInfoCircle /> };

    return (
      <Badge variant={status_info.variant} size="large">
        {status_info.icon} {status_info.text}
      </Badge>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loading />;
  if (!activity) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy hoạt động</h2>
        <Button onClick={() => navigate('/sinhvien/hoat-dong')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="chi-tiet-hoat-dong">
      {/* Header */}
      <div className="activity-detail-header">
        <Button 
          variant="secondary" 
          icon={<FaArrowLeft />}
          onClick={() => navigate('/sinhvien/hoat-dong')}
        >
          Quay lại
        </Button>
        <h1>Chi tiết hoạt động</h1>
      </div>

      {/* Main Content */}
      <div className="activity-detail-content">
        {/* Left Column - Activity Info */}
        <div className="activity-info-section">
          <div className="activity-card-detail">
            <div className="activity-header-detail">
              <h2>{activity.ten_hoat_dong}</h2>
              <div className="club-badge">
                <FaUniversity />
                <span>{activity.ten_clb}</span>
              </div>
              {activity.trang_thai && (
                <div className="activity-status-badge" style={{
                  background: activity.trang_thai === 'sap_dien_ra' ? '#3498db' : 
                             activity.trang_thai === 'dang_dien_ra' ? '#27ae60' : 
                             activity.trang_thai === 'da_ket_thuc' ? '#95a5a6' : '#e74c3c',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginTop: '10px',
                  display: 'inline-block'
                }}>
                  {getActivityStatusText(activity.trang_thai)}
                </div>
              )}
            </div>

            {activity.hinh_anh && (
              <div className="activity-image-large">
                <img 
                  src={`http://localhost:5000${activity.hinh_anh}`} 
                  alt={activity.ten_hoat_dong}
                />
              </div>
            )}

            <div className="activity-description-section">
              <h3><FaInfoCircle /> Mô tả hoạt động</h3>
              <p>{activity.mo_ta || 'Không có mô tả chi tiết'}</p>
            </div>

            <div className="activity-details-grid">
              <div className="detail-card">
                <div className="detail-icon">
                  <FaCalendar />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Thời gian bắt đầu</span>
                  <span className="detail-value">{formatDateTime(activity.thoi_gian_bat_dau)}</span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">
                  <FaClock />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Thời gian kết thúc</span>
                  <span className="detail-value">{formatDateTime(activity.thoi_gian_ket_thuc)}</span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Địa điểm</span>
                  <span className="detail-value">{activity.dia_diem}</span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">
                  <FaUsers />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Số lượng</span>
                  <span className="detail-value">
                    {activity.so_luong_da_dang_ky || 0} / {activity.so_luong_toi_da > 0 ? activity.so_luong_toi_da : '∞'} người
                  </span>
                </div>
              </div>

              {activity.quy_dinh_trang_phuc && (
                <div className="detail-card">
                  <div className="detail-icon">
                    <FaTshirt />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Trang phục</span>
                    <span className="detail-value">{activity.quy_dinh_trang_phuc}</span>
                  </div>
                </div>
              )}

              {activity.muc_dich && (
                <div className="detail-card">
                  <div className="detail-icon">
                    <FaBullseye />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Mục đích</span>
                    <span className="detail-value">{getMucDichText(activity.muc_dich)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Registration Status */}
        {registration && (
          <div className="registration-status-section">
            <div className="status-card">
              <h3>
                <FaCheckCircle className="success-icon" />
                Bạn đã tham gia hoạt động này
              </h3>

              <div className="status-info">
                <div className="status-item">
                  <span className="status-label">Trạng thái đăng ký:</span>
                  {getStatusBadge(registration.trang_thai_dang_ky)}
                </div>

                <div className="status-item">
                  <span className="status-label">Ngày đăng ký:</span>
                  <span className="status-value">
                    {new Date(registration.ngay_dang_ky).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {registration.ghi_chu && (
                  <div className="status-item full-width">
                    <span className="status-label">
                      <FaStickyNote /> Ghi chú của bạn:
                    </span>
                    <div className="note-box">
                      {registration.ghi_chu}
                    </div>
                  </div>
                )}

                {registration.ly_do_tu_choi && (
                  <div className="status-item full-width rejection-reason">
                    <span className="status-label">
                      <FaTimesCircle /> Lý do từ chối:
                    </span>
                    <div className="rejection-box">
                      {registration.ly_do_tu_choi}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {registration.trang_thai_dang_ky === 'cho_duyet' && (
                <div className="status-actions">
                  <Button 
                    variant="danger" 
                    onClick={handleCancelRegistration}
                    icon={<FaTimesCircle />}
                  >
                    Hủy đăng ký
                  </Button>
                </div>
              )}

              {registration.trang_thai_dang_ky === 'da_duyet' && (
                <div className="success-message">
                  <FaCheckCircle />
                  <p>Chúc mừng! Bạn đã được CLB phê duyệt tham gia hoạt động này.</p>
                  <p className="reminder">Hãy nhớ tham gia đúng giờ nhé! 🎉</p>
                </div>
              )}

              {registration.trang_thai_dang_ky === 'hoan_thanh' && (
                <div className="success-message">
                  <FaCheckCircle />
                  <p>Hoạt động đã hoàn thành! Cảm ơn bạn đã tham gia.</p>
                </div>
              )}
            </div>

            {/* Tips Card */}
            <div className="tips-card">
              <h4>💡 Lưu ý quan trọng</h4>
              <ul>
                <li>Vui lòng đến đúng giờ để được điểm danh</li>
                <li>Mang theo thẻ sinh viên</li>
                <li>Tuân thủ quy định về trang phục</li>
                <li>Liên hệ CLB nếu có vấn đề phát sinh</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChiTietHoatDong;
