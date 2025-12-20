import { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie, 
  FaCalendar, 
  FaUsers, 
  FaClipboardList, 
  FaStar, 
  FaCommentDots, 
  FaUser,
  FaCheckCircle,
  FaTrophy,
  FaUniversity,
  FaClock
} from 'react-icons/fa';
import { adminService, danhgiaService } from '../../services/api';
import './ThongKe.css';

// Mapping mục đích hoạt động
const MUC_DICH_LABELS = {
  've_nguon': { label: 'Về nguồn', color: '#667eea' },
  'van_nghe': { label: 'Văn nghệ', color: '#f093fb' },
  've_sinh': { label: 'Vệ sinh', color: '#43e97b' },
  'ho_tro': { label: 'Hỗ trợ', color: '#4facfe' },
  'cuoc_thi': { label: 'Cuộc thi', color: '#fa709a' },
  'toa_dam': { label: 'Tọa đàm', color: '#a855f7' },
  'the_thao': { label: 'Thể thao', color: '#f5576c' },
  'tinh_nguyen': { label: 'Tình nguyện', color: '#2ed573' },
  'hoi_thao': { label: 'Hội thảo', color: '#fbbf24' },
  'khac': { label: 'Khác', color: '#718096' }
};

const ThongKe = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [ratings, setRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [activeTab, setActiveTab] = useState('statistics');

  useEffect(() => {
    fetchStatistics();
    fetchRatings();
  }, [selectedPeriod]);

  const fetchStatistics = async () => {
    try {
      console.log('Fetching statistics with period:', selectedPeriod);
      const response = await adminService.getDetailedStatistics(selectedPeriod);
      console.log('Statistics response:', response.data);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch statistics error:', error);
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await danhgiaService.getAllRatings();
      const { ratings: fetchedRatings, statistics } = response.data;
      setRatings(fetchedRatings || []);
      setRatingStats(statistics || {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    } catch (error) {
      console.error('Fetch ratings error:', error);
      setRatings([]);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'giao_dien': 'Giao diện',
      'tinh_nang': 'Tính năng',
      'hieu_nang': 'Hiệu năng',
      'ho_tro': 'Hỗ trợ',
      'khac': 'Khác'
    };
    return labels[category] || category;
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      'sinh_vien': 'Sinh viên',
      'chu_nhiem': 'Chủ nhiệm CLB',
      'admin': 'Quản trị viên'
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getStatusLabel = (status) => {
    const labels = {
      'sap_dien_ra': 'Sắp diễn ra',
      'dang_dien_ra': 'Đang diễn ra',
      'da_ket_thuc': 'Đã kết thúc'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      'sap_dien_ra': 'status-upcoming',
      'dang_dien_ra': 'status-ongoing',
      'da_ket_thuc': 'status-completed'
    };
    return classes[status] || '';
  };

  // Tính max value cho biểu đồ
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
    <div className="thong-ke-container">
      <div className="thongke-page-header">
        <div className="header-content">
          <div className="header-icon">
            <FaChartLine size={32} />
          </div>
          <div>
            <h1>Thống Kê Hệ Thống</h1>
            <p>Báo cáo và phân tích dữ liệu hoạt động</p>
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

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          <FaChartBar /> Thống kê chung
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          <FaCommentDots /> Đánh giá người dùng
        </button>
      </div>

      {activeTab === 'statistics' ? (
        <>
          {/* Stats Overview */}
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon-wrapper blue">
                <FaUsers size={28} />
              </div>
              <div className="stat-details">
                <h3>{stats?.tong_quan?.tong_sinh_vien || 0}</h3>
                <p>Tổng sinh viên</p>
                <span className="stat-change positive">Đang hoạt động</span>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon-wrapper green">
                <FaClipboardList size={28} />
              </div>
              <div className="stat-details">
                <h3>{stats?.tong_quan?.hoat_dong_da_to_chuc || 0}</h3>
                <p>Hoạt động đã tổ chức</p>
                <span className="stat-change positive">Đã hoàn thành</span>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon-wrapper orange">
                <FaCheckCircle size={28} />
              </div>
              <div className="stat-details">
                <h3>{stats?.tong_quan?.luot_tham_gia || 0}</h3>
                <p>Lượt tham gia</p>
                <span className="stat-change positive">Hoàn thành</span>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon-wrapper purple">
                <FaChartPie size={28} />
              </div>
              <div className="stat-details">
                <h3>{stats?.tong_quan?.ty_le_tham_gia || 0}%</h3>
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
                <h3><FaChartBar /> Hoạt động theo tháng (12 tháng gần nhất)</h3>
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

            {/* Thống kê theo CLB */}
            <div className="chart-card">
              <div className="chart-header">
                <h3><FaUniversity /> Thống kê theo CLB</h3>
              </div>
              {stats?.thong_ke_theo_clb?.length > 0 ? (
                <div className="clb-stats-list">
                  {stats.thong_ke_theo_clb.map((clb, index) => (
                    <div key={index} className="clb-stat-item">
                      <div className="clb-info">
                        <span className="clb-rank">#{index + 1}</span>
                        <span className="clb-name">{clb.ten_clb}</span>
                      </div>
                      <div className="clb-numbers">
                        <span className="clb-activities">{clb.so_hoat_dong} HĐ</span>
                        <span className="clb-registrations">{clb.so_dang_ky} ĐK</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="chart-placeholder">
                  <FaUniversity size={48} className="placeholder-icon" />
                  <p>Chưa có dữ liệu CLB</p>
                </div>
              )}
            </div>

            {/* Thống kê theo mục đích */}
            <div className="chart-card">
              <div className="chart-header">
                <h3><FaChartPie /> Phân loại theo mục đích</h3>
              </div>
              {stats?.thong_ke_theo_muc_dich?.length > 0 ? (
                <div className="purpose-stats">
                  {stats.thong_ke_theo_muc_dich.map((item, index) => (
                    <div key={index} className="purpose-item">
                      <div className="purpose-info">
                        <span 
                          className="purpose-dot" 
                          style={{ background: MUC_DICH_LABELS[item.muc_dich]?.color || '#718096' }}
                        ></span>
                        <span className="purpose-name">
                          {MUC_DICH_LABELS[item.muc_dich]?.label || item.muc_dich}
                        </span>
                      </div>
                      <div className="purpose-bar-wrapper">
                        <div 
                          className="purpose-bar"
                          style={{ 
                            width: `${(item.so_luong / getMaxValue(stats.thong_ke_theo_muc_dich, 'so_luong')) * 100}%`,
                            background: MUC_DICH_LABELS[item.muc_dich]?.color || '#718096'
                          }}
                        ></div>
                      </div>
                      <span className="purpose-count">{item.so_luong}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="chart-placeholder">
                  <FaChartPie size={48} className="placeholder-icon" />
                  <p>Chưa có dữ liệu</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="bottom-section">
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
                          <span><FaUniversity /> {hd.don_vi}</span>
                          <span><FaClock /> {formatDate(hd.thoi_gian_bat_dau)}</span>
                          <span><FaUsers /> {hd.so_tham_gia} người</span>
                        </div>
                      </div>
                      <span className={`activity-status ${getStatusClass(hd.trang_thai)}`}>
                        {getStatusLabel(hd.trang_thai)}
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

            {/* Top sinh viên */}
            <div className="top-students">
              <h3><FaTrophy /> Top sinh viên tích cực</h3>
              {stats?.top_sinh_vien?.length > 0 ? (
                <div className="students-list">
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
                        <span className="score-label">hoạt động</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaTrophy size={48} className="empty-icon" />
                  <p>Chưa có dữ liệu</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="ratings-section">
          {/* Rating Overview */}
          <div className="rating-overview">
            <div className="rating-summary">
              <div className="average-rating">
                <h2>{ratingStats.average?.toFixed(1) || '0.0'}</h2>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar 
                      key={star} 
                      className={star <= Math.round(ratingStats.average || 0) ? 'active' : ''} 
                    />
                  ))}
                </div>
                <p>{ratingStats.total || 0} đánh giá</p>
              </div>
              
              <div className="rating-distribution">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="distribution-row">
                    <span className="star-label">{star} <FaStar /></span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${ratingStats.total > 0 ? ((ratingStats.distribution?.[star] || 0) / ratingStats.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="count">{ratingStats.distribution?.[star] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rating List */}
          <div className="ratings-list">
            <h3><FaCommentDots /> Nhận xét từ người dùng</h3>
            {ratings.length === 0 ? (
              <div className="empty-state">
                <FaUser size={48} className="empty-icon" />
                <p>Chưa có đánh giá nào</p>
              </div>
            ) : (
              <div className="rating-cards">
                {ratings.map((rating) => (
                  <div key={rating.id} className="rating-card">
                    <div className="rating-card-header">
                      <div className="user-info">
                        <div className="user-avatar">
                          <FaUser />
                        </div>
                        <div>
                          <h4>{rating.user_name}</h4>
                          <span className="user-type">{getUserTypeLabel(rating.user_type)}</span>
                        </div>
                      </div>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar 
                            key={star} 
                            className={star <= rating.rating ? 'active' : 'inactive'} 
                            size={16}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="rating-card-body">
                      <div className="category-badge">{getCategoryLabel(rating.category)}</div>
                      {rating.feedback && <p className="feedback-text">{rating.feedback}</p>}
                      <span className="rating-date">
                        {new Date(rating.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThongKe;
