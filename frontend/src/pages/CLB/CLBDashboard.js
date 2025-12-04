import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { clbService } from '../../services/api';
import { 
  FaPlus, 
  FaUsers, 
  FaClipboardList, 
  FaChartBar,
  FaTachometerAlt,
  FaArrowUp,
  FaCalendarPlus,
  FaUserCheck,
  FaStar,
  FaTrophy
} from 'react-icons/fa';
import TaoHoatDong from './TaoHoatDong';
import QuanLyHoatDong from './QuanLyHoatDong';
import QuanLyThanhVien from './QuanLyThanhVien';
import DanhSachDangKy from './DanhSachDangKy';
import './CLBDashboard.css';

const CLBHome = () => {
  const [club, setClub] = useState(null);
  const [stats, setStats] = useState({
    activities: 0,
    members: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubInfo();
  }, []);

  const fetchClubInfo = async () => {
    try {
      const [clubRes, activitiesRes, membersRes, requestsRes] = await Promise.all([
        clbService.getMyClub(),
        clbService.getActivities(),
        clbService.getMembers(),
        clbService.getMemberRequests()
      ]);

      setClub(clubRes.data);
      setStats({
        activities: activitiesRes.data.length,
        members: membersRes.data.length,
        pending: requestsRes.data.length
      });
      setLoading(false);
    } catch (error) {
      console.error('Fetch club info error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="modern-spinner"></div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="error-message">
        <h2>Không tìm thấy thông tin câu lạc bộ</h2>
      </div>
    );
  }

  const statsData = [
    {
      icon: FaClipboardList,
      value: stats.activities,
      label: 'Hoạt động',
      color: 'primary',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      change: '+3 tháng này',
      bgPattern: 'pattern1'
    },
    {
      icon: FaUsers,
      value: stats.members,
      label: 'Thành viên',
      color: 'success',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      change: `+${stats.pending} mới`,
      bgPattern: 'pattern2'
    },
    {
      icon: FaUserCheck,
      value: stats.pending,
      label: 'Chờ phê duyệt',
      color: 'warning',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      change: 'Cần xử lý',
      bgPattern: 'pattern3'
    }
  ];

  return (
    <div className="clb-home">
      <div className="club-banner">
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <div className="club-logo">
            <FaTrophy size={40} />
          </div>
          <div className="club-info">
            <h1 className="club-name">{club.ten_clb}</h1>
            <p className="club-description">{club.mo_ta}</p>
            <div className="club-meta">
              <span className="meta-item">
                <FaStar /> Hoạt động tích cực
              </span>
              <span className="meta-item">
                <FaUsers /> {stats.members} thành viên
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-container">
        <div className="stats-grid-clb">
          {statsData.map((stat, index) => (
            <div key={index} className={`stat-card-clb stat-${stat.color}`}>
              <div className={`stat-bg-pattern ${stat.bgPattern}`}></div>
              <div className="stat-card-content">
                <div className="stat-top">
                  <div className="stat-icon-wrapper" style={{ background: stat.gradient }}>
                    <stat.icon size={28} />
                  </div>
                  <span className="stat-badge">{stat.change}</span>
                </div>
                <div className="stat-bottom">
                  <h3 className="stat-number">{stat.value}</h3>
                  <p className="stat-title">{stat.label}</p>
                </div>
                <div className="stat-sparkline">
                  <svg viewBox="0 0 100 30" className="sparkline-svg">
                    <polyline
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      points="0,20 20,15 40,18 60,10 80,12 100,5"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-actions-section">
        <div className="section-header">
          <h2 className="section-title">
            <FaTachometerAlt className="section-icon" />
            Thao tác nhanh
          </h2>
        </div>
        
        <div className="action-cards-grid">
          <Link to="/caulacbo/tao-hoat-dong" className="action-card action-card-create">
            <div className="action-card-bg"></div>
            <div className="action-card-content">
              <div className="action-card-icon">
                <FaCalendarPlus size={32} />
              </div>
              <h3>Tạo hoạt động mới</h3>
              <p>Lên kế hoạch và tổ chức sự kiện cho câu lạc bộ</p>
              <div className="action-card-footer">
                <span className="action-link">Bắt đầu ngay <FaArrowUp style={{ transform: 'rotate(45deg)' }} /></span>
              </div>
            </div>
          </Link>

          <Link to="/caulacbo/thanh-vien" className="action-card action-card-members">
            <div className="action-card-bg"></div>
            <div className="action-card-content">
              <div className="action-card-icon">
                <FaUsers size={32} />
              </div>
              <h3>Quản lý thành viên</h3>
              <p>Xem danh sách và phê duyệt thành viên mới</p>
              <div className="action-card-footer">
                <span className="action-link">Xem chi tiết <FaArrowUp style={{ transform: 'rotate(45deg)' }} /></span>
              </div>
            </div>
          </Link>

          <Link to="/caulacbo/hoat-dong" className="action-card action-card-activities">
            <div className="action-card-bg"></div>
            <div className="action-card-content">
              <div className="action-card-icon">
                <FaClipboardList size={32} />
              </div>
              <h3>Quản lý hoạt động</h3>
              <p>Theo dõi tiến độ các hoạt động đang diễn ra</p>
              <div className="action-card-footer">
                <span className="action-link">Quản lý ngay <FaArrowUp style={{ transform: 'rotate(45deg)' }} /></span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

const CLBDashboard = () => {
  const location = useLocation();

  return (
    <div className="clb-dashboard">
      <div className="clb-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon-clb">
              <FaTrophy size={24} />
            </div>
            <h2>Câu lạc bộ</h2>
          </div>
        </div>
        <nav className="clb-nav">
          <Link 
            to="/caulacbo" 
            className={`nav-item ${location.pathname === '/caulacbo' ? 'active' : ''}`}
          >
            <FaTachometerAlt />
            <span>Tổng quan</span>
          </Link>
          <Link 
            to="/caulacbo/tao-hoat-dong" 
            className={`nav-item ${location.pathname === '/caulacbo/tao-hoat-dong' ? 'active' : ''}`}
          >
            <FaPlus />
            <span>Tạo hoạt động</span>
          </Link>
          <Link 
            to="/caulacbo/hoat-dong" 
            className={`nav-item ${location.pathname === '/caulacbo/hoat-dong' ? 'active' : ''}`}
          >
            <FaClipboardList />
            <span>Quản lý hoạt động</span>
          </Link>
          <Link 
            to="/caulacbo/thanh-vien" 
            className={`nav-item ${location.pathname === '/caulacbo/thanh-vien' ? 'active' : ''}`}
          >
            <FaUsers />
            <span>Quản lý thành viên</span>
          </Link>
        </nav>
        <div className="sidebar-footer-clb">
          <div className="clb-stats-mini">
            <div className="mini-stat">
              <FaUsers className="mini-icon" />
              <div>
                <span className="mini-value">Active</span>
                <span className="mini-label">Status</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="clb-content">
        <Routes>
          <Route index element={<CLBHome />} />
          <Route path="tao-hoat-dong" element={<TaoHoatDong />} />
          <Route path="hoat-dong" element={<QuanLyHoatDong />} />
          <Route path="thanh-vien" element={<QuanLyThanhVien />} />
          <Route path="danh-sach-dang-ky/:hoatDongId" element={<DanhSachDangKy />} />
        </Routes>
      </div>
    </div>
  );
};

export default CLBDashboard;
