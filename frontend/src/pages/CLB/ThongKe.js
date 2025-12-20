import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie, 
  FaCalendar, 
  FaUsers, 
  FaClipboardList,
  FaCheckCircle,
  FaTrophy,
  FaClock,
  FaUniversity
} from 'react-icons/fa';
import { clbService } from '../../services/api';
import './ThongKe.css';

const ThongKe = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const fetchStatistics = async () => {
    try {
      const response = await clbService.getStatistics();
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch statistics error:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getStatusLabel = (status, statusDuyet) => {
    if (statusDuyet === 'cho_duyet') return 'Chờ duyệt';
    const labels = {
      'sap_dien_ra': 'Sắp diễn ra',
      'dang_dien_ra': 'Đang diễn ra',
      'da_ket_thuc': 'Đã kết thúc',
      'huy': 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status, statusDuyet) => {
    if (statusDuyet === 'cho_duyet') return 'status-pending';
    const classes = {
      'sap_dien_ra': 'status-upcoming',
      'dang_dien_ra': 'status-ongoing',
      'da_ket_thuc': 'status-completed',
      'huy': 'status-cancelled'
    };
    return classes[status] || '';
  };

  const getMaxValue = (data, key) => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(item => item[key] || 0), 1);
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="modern-spinner"></div>
      </div>
    );
  }

  return (
    <div className="thong-ke-clb-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <FaChartLine size={32} />
          </div>
          <div>
            <h1>Thống Kê {stats?.ten_clb || 'Câu Lạc Bộ'}</h1>
            <p>Báo cáo và phân tích hoạt động của CLB</p>
          </div>
        </div>
        <div className="period-selector">
          <button 
            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Tuần
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            Tháng
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('year')}
          >
            Năm
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-icon-wrapper pink">
            <FaUsers size={28} />
          </div>
          <div className="stat-details">
            <h3>{stats?.tong_quan?.tong_thanh_vien || 0}</h3>
            <p>Thành viên</p>
            <span className="stat-change positive">Đang hoạt động</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper coral">
            <FaClipboardList size={28} />
          </div>
          <div className="stat-details">
            <h3>{stats?.tong_quan?.tong_hoat_dong || 0}</h3>
            <p>Hoạt động đã tổ chức</p>
            <span className="stat-change positive">Đã được duyệt</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper purple">
            <FaCheckCircle size={28} />
          </div>
          <div className="stat-details">
            <h3>{stats?.tong_quan?.luot_tham_gia || 0}</h3>
            <p>Lượt tham gia</p>
            <span className="stat-change positive">Hoàn thành</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper blue">
            <FaChartPie size={28} />
          </div>
          <div className="stat-details">
            <h3>{stats?.tong_quan?.ty_le_hoan_thanh || 0}%</h3>
            <p>Tỷ lệ hoàn thành</p>
            <span className="stat-change">Trung bình</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Biểu đồ hoạt động theo tháng */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3><FaChartBar /> Hoạt động theo tháng (6 tháng gần nhất)</h3>
          </div>
          {stats?.hoat_dong_theo_thang?.length > 0 ? (
            <div className="bar-chart">
              {stats.hoat_dong_theo_thang.map((item, index) => (
                <div key={index} className="bar-item">
                  <div className="bar-wrapper">
                    <div 
                      className="bar" 
                      style={{ 
                        height: `${(item.so_hoat_dong / getMaxValue(stats.hoat_dong_theo_thang, 'so_hoat_dong')) * 100}%` 
                      }}
                    >
                      <span className="bar-value">{item.so_hoat_dong}</span>
                    </div>
                  </div>
                  <span className="bar-label">{item.thang?.slice(5)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-placeholder">
              <FaChartBar size={48} className="placeholder-icon" />
              <p>Chưa có dữ liệu hoạt động</p>
            </div>
          )}
        </div>

        {/* Thành viên theo khoa */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><FaUniversity /> Thành viên theo khoa</h3>
          </div>
          {stats?.thanh_vien_theo_khoa?.length > 0 ? (
            <div className="khoa-stats">
              {stats.thanh_vien_theo_khoa.map((item, index) => (
                <div key={index} className="khoa-item">
                  <div className="khoa-info">
                    <span className="khoa-name">{item.khoa || 'Chưa xác định'}</span>
                  </div>
                  <div className="khoa-bar-wrapper">
                    <div 
                      className="khoa-bar"
                      style={{ 
                        width: `${(item.so_luong / getMaxValue(stats.thanh_vien_theo_khoa, 'so_luong')) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="khoa-count">{item.so_luong}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-placeholder">
              <FaChartPie size={48} className="placeholder-icon" />
              <p>Chưa có dữ liệu thành viên</p>
            </div>
          )}
        </div>

        {/* Top sinh viên tích cực */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><FaTrophy /> Top sinh viên tích cực</h3>
          </div>
          {stats?.top_sinh_vien?.length > 0 ? (
            <div className="top-students-list">
              {stats.top_sinh_vien.map((sv, index) => (
                <div key={index} className="student-item">
                  <div className={`student-rank rank-${index + 1}`}>
                    {index < 3 ? <FaTrophy /> : index + 1}
                  </div>
                  <div className="student-info">
                    <h4>{sv.ho_ten}</h4>
                    <span>{sv.ma_sinh_vien} - {sv.lop}</span>
                  </div>
                  <div className="student-score">
                    <span className="score-number">{sv.so_hoat_dong}</span>
                    <span className="score-label">HĐ</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-placeholder">
              <FaTrophy size={48} className="placeholder-icon" />
              <p>Chưa có dữ liệu</p>
            </div>
          )}
        </div>
      </div>

      {/* Hoạt động gần đây */}
      <div className="recent-activities">
        <h3><FaCalendar /> Hoạt động gần đây</h3>
        {stats?.hoat_dong_gan_day?.length > 0 ? (
          <div className="activities-list">
            {stats.hoat_dong_gan_day.map((hd, index) => (
              <div key={index} className="activity-item">
                <div className="activity-main">
                  <h4>{hd.ten_hoat_dong}</h4>
                  <div className="activity-meta">
                    <span><FaClock /> {formatDate(hd.thoi_gian_bat_dau)}</span>
                    <span><FaUsers /> {hd.so_tham_gia} người tham gia</span>
                  </div>
                </div>
                <span className={`activity-status ${getStatusClass(hd.trang_thai, hd.trang_thai_duyet)}`}>
                  {getStatusLabel(hd.trang_thai, hd.trang_thai_duyet)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaCalendar size={48} className="empty-icon" />
            <p>Chưa có dữ liệu hoạt động</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThongKe;
