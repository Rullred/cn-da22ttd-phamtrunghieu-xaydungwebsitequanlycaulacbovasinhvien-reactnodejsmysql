import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import { 
  FaUsers, 
  FaClipboardCheck, 
  FaUniversity, 
  FaChartBar,
  FaTachometerAlt,
  FaArrowUp,
  FaArrowDown,
  FaBell,
  FaCalendarAlt,
  FaUserGraduate
} from 'react-icons/fa';
import PheDuyetHoatDong from './PheDuyetHoatDong';
import QuanLyCauLacBo from './QuanLyCauLacBo';
import QuanLySinhVien from './QuanLySinhVien';
import './AdminDashboard.css';

const AdminHome = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    tong_sinh_vien: 0,
    tong_clb: 0,
    hoat_dong_sap_toi: 0,
    tai_khoan_cho_duyet: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await adminService.getStatistics();
      setStatistics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch statistics error:', error);
      setLoading(false);
    }
  };

  const statsData = [
    {
      icon: FaUsers,
      value: statistics.tong_sinh_vien,
      label: 'Sinh viên',
      color: 'primary',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      link: '/admin/sinh-vien'
    },
    {
      icon: FaUniversity,
      value: statistics.tong_clb,
      label: 'Câu lạc bộ',
      color: 'success',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      link: '/admin/cau-lac-bo'
    },
    {
      icon: FaCalendarAlt,
      value: statistics.hoat_dong_sap_toi,
      label: 'Hoạt động sắp tới',
      color: 'info',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      link: '/admin/phe-duyet'
    },
    {
      icon: FaClipboardCheck,
      value: statistics.hoat_dong_cho_duyet || 0,
      label: 'Hoạt động chờ duyệt',
      color: 'warning',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      link: '/admin/phe-duyet'
    }
  ];

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="modern-spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div 
            key={index} 
            className={`stat-card stat-${stat.color}`}
            onClick={() => navigate(stat.link)}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-card-inner">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: stat.gradient }}>
                  <stat.icon size={28} />
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value.toLocaleString()}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
              <div className="stat-footer">
                <div className="stat-progress">
                  <div 
                    className="stat-progress-bar" 
                    style={{ background: stat.gradient, width: '70%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="quick-actions-card">
          <div className="card-header">
            <h2 className="card-title">
              <FaTachometerAlt className="title-icon" />
              Thao tác nhanh
            </h2>
          </div>
          <div className="action-buttons-grid">
            <Link to="/admin/phe-duyet" className="action-btn action-btn-primary">
              <div className="action-btn-icon">
                <FaClipboardCheck size={24} />
              </div>
              <div className="action-btn-content">
                <h3>Phê duyệt hoạt động</h3>
                <p>Xét duyệt các hoạt động từ CLB</p>
              </div>
            </Link>
            <Link to="/admin/cau-lac-bo" className="action-btn action-btn-success">
              <div className="action-btn-icon">
                <FaUniversity size={24} />
              </div>
              <div className="action-btn-content">
                <h3>Quản lý CLB</h3>
                <p>Giám sát các câu lạc bộ</p>
              </div>
            </Link>
            <Link to="/admin/sinh-vien" className="action-btn action-btn-info">
              <div className="action-btn-icon">
                <FaUserGraduate size={24} />
              </div>
              <div className="action-btn-content">
                <h3>Quản lý sinh viên</h3>
                <p>Quản lý thông tin sinh viên</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="recent-activity-card">
          <div className="card-header">
            <h2 className="card-title">
              <FaChartBar className="title-icon" />
              Hoạt động gần đây
            </h2>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon activity-icon-success">
                <FaUsers />
              </div>
              <div className="activity-content">
                <p className="activity-text">Có 5 sinh viên mới đăng ký</p>
                <span className="activity-time">10 phút trước</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon activity-icon-info">
                <FaUniversity />
              </div>
              <div className="activity-content">
                <p className="activity-text">CLB Nghệ thuật tạo hoạt động mới</p>
                <span className="activity-time">2 giờ trước</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon activity-icon-warning">
                <FaClipboardCheck />
              </div>
              <div className="activity-content">
                <p className="activity-text">3 hoạt động chờ phê duyệt</p>
                <span className="activity-time">5 giờ trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <FaTachometerAlt size={24} />
            </div>
            <h2>Quản trị viên</h2>
          </div>
        </div>
        <nav className="admin-nav">
          <Link 
            to="/admin" 
            className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            <FaChartBar />
            <span>Tổng quan</span>
          </Link>
          <Link 
            to="/admin/phe-duyet" 
            className={`nav-item ${location.pathname === '/admin/phe-duyet' ? 'active' : ''}`}
          >
            <FaClipboardCheck />
            <span>Phê duyệt hoạt động</span>
          </Link>
          <Link 
            to="/admin/cau-lac-bo" 
            className={`nav-item ${location.pathname === '/admin/cau-lac-bo' ? 'active' : ''}`}
          >
            <FaUniversity />
            <span>Quản lý CLB</span>
          </Link>
          <Link 
            to="/admin/sinh-vien" 
            className={`nav-item ${location.pathname === '/admin/sinh-vien' ? 'active' : ''}`}
          >
            <FaUserGraduate />
            <span>Quản lý sinh viên</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <FaUsers />
            </div>
            <div className="user-details">
              <p className="user-name">Admin</p>
              <p className="user-role">Quản trị viên</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="phe-duyet" element={<PheDuyetHoatDong />} />
          <Route path="cau-lac-bo" element={<QuanLyCauLacBo />} />
          <Route path="sinh-vien" element={<QuanLySinhVien />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
