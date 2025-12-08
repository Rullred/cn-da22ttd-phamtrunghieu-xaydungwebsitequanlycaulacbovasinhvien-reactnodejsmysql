import React, { useState, useEffect } from 'react';
import { FaChartLine, FaChartBar, FaChartPie, FaCalendar, FaUsers, FaClipboardList, FaStar, FaCommentDots, FaUser } from 'react-icons/fa';
import { danhgiaService } from '../../services/api';
import './ThongKe.css';

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
    // TODO: Implement API call to fetch statistics
    // Placeholder data for now
    setLoading(false);
  };

  const fetchRatings = async () => {
    try {
      const response = await danhgiaService.getAllRatings();
      const { ratings: fetchedRatings, statistics } = response.data;
      
      setRatings(fetchedRatings);
      setRatingStats(statistics);
    } catch (error) {
      console.error('Fetch ratings error:', error);
      // Fallback to empty state if error
      setRatings([]);
      setRatingStats({
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
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

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="modern-spinner"></div>
      </div>
    );
  }

  return (
    <div className="thong-ke-container">
      <div className="page-header">
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
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon-wrapper blue">
                <FaUsers size={28} />
              </div>
              <div className="stat-details">
                <h3>0</h3>
                <p>Tổng sinh viên</p>
                <span className="stat-change positive">+0% so với tháng trước</span>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon-wrapper green">
                <FaClipboardList size={28} />
              </div>
              <div className="stat-details">
                <h3>0</h3>
                <p>Hoạt động đã tổ chức</p>
                <span className="stat-change positive">+0% so với tháng trước</span>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon-wrapper orange">
                <FaCalendar size={28} />
              </div>
              <div className="stat-details">
                <h3>0</h3>
                <p>Lượt tham gia</p>
                <span className="stat-change positive">+0% so với tháng trước</span>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon-wrapper purple">
                <FaChartPie size={28} />
              </div>
              <div className="stat-details">
                <h3>0%</h3>
                <p>Tỷ lệ tham gia</p>
                <span className="stat-change">Trung bình</span>
              </div>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3><FaChartBar /> Biểu đồ hoạt động theo tháng</h3>
              </div>
              <div className="chart-placeholder">
                <FaChartBar size={48} className="placeholder-icon" />
                <p>Biểu đồ đang được phát triển</p>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3><FaChartPie /> Phân bố theo câu lạc bộ</h3>
              </div>
              <div className="chart-placeholder">
                <FaChartPie size={48} className="placeholder-icon" />
                <p>Biểu đồ đang được phát triển</p>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3><FaChartLine /> Xu hướng tham gia</h3>
              </div>
              <div className="chart-placeholder">
                <FaChartLine size={48} className="placeholder-icon" />
                <p>Biểu đồ đang được phát triển</p>
              </div>
            </div>
          </div>

          <div className="recent-activities">
            <h3>Hoạt động gần đây</h3>
            <div className="empty-state">
              <FaCalendar size={48} className="empty-icon" />
              <p>Chưa có dữ liệu hoạt động</p>
            </div>
          </div>
        </>
      ) : (
        <div className="ratings-section">
          {/* Rating Overview */}
          <div className="rating-overview">
            <div className="rating-summary">
              <div className="average-rating">
                <h2>{ratingStats.average}</h2>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar 
                      key={star} 
                      className={star <= Math.round(ratingStats.average) ? 'active' : ''} 
                    />
                  ))}
                </div>
                <p>{ratingStats.total} đánh giá</p>
              </div>
              
              <div className="rating-distribution">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="distribution-row">
                    <span className="star-label">{star} <FaStar /></span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${ratingStats.total > 0 ? (ratingStats.distribution[star] / ratingStats.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="count">{ratingStats.distribution[star]}</span>
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
