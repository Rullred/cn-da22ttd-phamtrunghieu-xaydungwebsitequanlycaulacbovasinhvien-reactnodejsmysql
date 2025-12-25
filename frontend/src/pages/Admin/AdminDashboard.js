import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import { adminService, thongbaoService } from '../../services/api';
import { 
  FaUsers, 
  FaClipboardCheck, 
  FaUniversity, 
  FaChartBar,
  FaTachometerAlt,
  FaBell,
  FaCalendarAlt,
  FaUserGraduate,
  FaTrophy,
  FaChartLine,
  FaClock,
  FaPlusCircle,
  FaListAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaFileAlt,
  FaComments
} from 'react-icons/fa';
import PheDuyetHoatDong from './PheDuyetHoatDong';
import QuanLyCauLacBo from './QuanLyCauLacBo';
import QuanLySinhVien from './QuanLySinhVien';
import TopSinhVien from './TopSinhVien';
import ThongKe from './ThongKe';
import TaoHoatDong from './TaoHoatDong';
import QuanLyHoatDong from './QuanLyHoatDong';
import DanhSachHoatDong from './DanhSachHoatDong';
import ChatList from '../Chat/ChatList';
import ChatRoom from '../Chat/ChatRoom';
import './AdminDashboard.css';

const AdminHome = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    tong_sinh_vien: 0,
    tong_clb: 0,
    hoat_dong_sap_toi: 0,
    tai_khoan_cho_duyet: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
    fetchNotifications();
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

  const fetchNotifications = async () => {
    try {
      const response = await thongbaoService.getNotifications();
      setNotifications(response.data.slice(0, 5)); // Lấy 5 thông báo gần nhất
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'duyet_hoat_dong':
      case 'hoat_dong_moi':
        return { icon: FaCalendarAlt, className: 'activity-icon-info' };
      case 'tai_khoan_duyet':
      case 'dang_ky_thanh_cong':
        return { icon: FaCheckCircle, className: 'activity-icon-success' };
      case 'tai_khoan_tu_choi':
      case 'hoat_dong_tu_choi':
        return { icon: FaTimesCircle, className: 'activity-icon-danger' };
      case 'duyet_thanh_vien_clb':
        return { icon: FaUsers, className: 'activity-icon-warning' };
      default:
        return { icon: FaInfoCircle, className: 'activity-icon-primary' };
    }
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
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
      {/* Hero Section */}
      <div className="admin-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="gradient-text">Chào mừng trở lại,</span>
              <br />
              <span className="hero-name">Quản trị viên</span>
            </h1>
            <p className="hero-subtitle">
              Quản lý hệ thống câu lạc bộ và hoạt động sinh viên một cách hiệu quả
            </p>
          </div>
          <div className="hero-illustration">
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
            <FaTachometerAlt className="hero-icon" size={120} />
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,80 600,80 900,0 L1200,0 L1200,120 L0,120 Z" fill="rgba(255,255,255,0.1)"></path>
          </svg>
        </div>
      </div>

      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div 
            key={index} 
            className={`stat-card stat-${stat.color} animate-${index}`}
            onClick={() => navigate(stat.link)}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-card-inner">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: stat.gradient }}>
                  <stat.icon size={32} />
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">
                  <span className="counting-number">{stat.value.toLocaleString()}</span>
                </h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="quick-actions-card glass-card">
          <div className="card-header">
            <div className="card-title-wrapper">
              <div className="card-icon-wrapper">
                <FaTachometerAlt className="title-icon pulse-icon" />
              </div>
              <div>
                <h2 className="card-title">Thao tác nhanh</h2>
                <p className="card-subtitle">Các tính năng thường dùng</p>
              </div>
            </div>
          </div>
          <div className="action-buttons-grid">
            <Link to="/admin/phe-duyet" className="action-btn action-btn-primary">
              <div className="action-btn-bg"></div>
              <div className="action-btn-icon">
                <FaClipboardCheck size={28} />
              </div>
              <div className="action-btn-content">
                <h3>Phê duyệt hoạt động</h3>
                <p>Xét duyệt {statistics.hoat_dong_cho_duyet || 0} hoạt động đang chờ</p>
              </div>
              <div className="action-btn-arrow">→</div>
            </Link>
            <Link to="/admin/cau-lac-bo" className="action-btn action-btn-success">
              <div className="action-btn-bg"></div>
              <div className="action-btn-icon">
                <FaUniversity size={28} />
              </div>
              <div className="action-btn-content">
                <h3>Quản lý CLB</h3>
                <p>Giám sát {statistics.tong_clb} câu lạc bộ</p>
              </div>
              <div className="action-btn-arrow">→</div>
            </Link>
            <Link to="/admin/sinh-vien" className="action-btn action-btn-info">
              <div className="action-btn-bg"></div>
              <div className="action-btn-icon">
                <FaUserGraduate size={28} />
              </div>
              <div className="action-btn-content">
                <h3>Quản lý sinh viên</h3>
                <p>{statistics.tong_sinh_vien} sinh viên đang hoạt động</p>
              </div>
              <div className="action-btn-arrow">→</div>
            </Link>
            <Link to="/admin/top-sinh-vien" className="action-btn action-btn-warning">
              <div className="action-btn-bg"></div>
              <div className="action-btn-icon">
                <FaTrophy size={28} />
              </div>
              <div className="action-btn-content">
                <h3>Bảng xếp hạng</h3>
                <p>Xem top sinh viên nổi bật</p>
              </div>
              <div className="action-btn-arrow">→</div>
            </Link>
          </div>
        </div>

        <div className="recent-activity-card glass-card">
          <div className="card-header">
            <div className="card-title-wrapper">
              <div className="card-icon-wrapper">
                <FaBell className="title-icon ring-icon" />
              </div>
              <div>
                <h2 className="card-title">Thông báo gần đây</h2>
                <p className="card-subtitle">Cập nhật mới nhất trong hệ thống</p>
              </div>
            </div>
          </div>
          <div className="activity-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <FaBell size={32} className="empty-icon" />
                <p>Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif, index) => {
                const { icon: NotifIcon, className } = getNotificationIcon(notif.loai_thong_bao);
                return (
                  <div 
                    key={notif.id} 
                    className={`activity-item slide-in ${!notif.da_doc ? 'unread' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`activity-icon ${className}`}>
                      <NotifIcon />
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{notif.tieu_de}</strong>
                      </p>
                      <p className="activity-desc">{notif.noi_dung}</p>
                      <span className="activity-time">
                        <FaClock className="time-icon" /> {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
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
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FaChartBar />
            <span>Tổng quan</span>
          </NavLink>
          <NavLink 
            to="/admin/tao-hoat-dong" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FaPlusCircle />
            <span>Tạo hoạt động</span>
          </NavLink>
          <NavLink 
            to="/admin/quan-ly-hoat-dong" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FaListAlt />
            <span>Quản lý hoạt động</span>
          </NavLink>
          <NavLink 
            to="/admin/phe-duyet" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FaClipboardCheck />
            <span>Phê duyệt hoạt động</span>
          </NavLink>
          <NavLink 
            to="/admin/cau-lac-bo" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FaUniversity />
            <span>Quản lý CLB</span>
          </NavLink>
          <NavLink 
            to="/admin/sinh-vien" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FaUserGraduate />
            <span>Quản lý sinh viên</span>
          </NavLink>
          <NavLink 
            to="/admin/top-sinh-vien" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FaTrophy />
            <span>Top Sinh Viên</span>
          </NavLink>
          <NavLink 
            to="/admin/thong-ke" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FaChartLine />
            <span>Thống kê</span>
          </NavLink>
          <NavLink 
            to="/admin/danh-sach-hoat-dong" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FaFileAlt />
            <span>Danh sách hoạt động</span>
          </NavLink>
          <NavLink 
            to="/admin/chat" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FaComments />
            <span>Phòng chat</span>
          </NavLink>
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
          <Route path="tao-hoat-dong" element={<TaoHoatDong />} />
          <Route path="quan-ly-hoat-dong" element={<QuanLyHoatDong />} />
          <Route path="phe-duyet" element={<PheDuyetHoatDong />} />
          <Route path="cau-lac-bo" element={<QuanLyCauLacBo />} />
          <Route path="sinh-vien" element={<QuanLySinhVien />} />
          <Route path="top-sinh-vien" element={<TopSinhVien />} />
          <Route path="thong-ke" element={<ThongKe />} />
          <Route path="danh-sach-hoat-dong" element={<DanhSachHoatDong />} />
          <Route path="chat" element={<ChatList />} />
          <Route path="chat/:roomId" element={<ChatRoom />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
