import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import { sinhvienService } from '../../services/api';
import { FaCalendar, FaClipboardList, FaUser, FaTrophy, FaChartLine, FaCommentDots, FaComments, FaClipboardCheck, FaUserPlus } from 'react-icons/fa';
import DanhSachHoatDong from './DanhSachHoatDong';
import HoatDongCuaToi from './HoatDongCuaToi';
import TrangThaiDangKy from './TrangThaiDangKy';
import DangKyCLB from './DangKyCLB';
import Profile from './Profile';
import TopSinhVien from './TopSinhVien';
import ThongKe from './ThongKe';
import DanhGia from './DanhGia';
import ChatList from '../Chat/ChatList';
import ChatRoom from '../Chat/ChatRoom';
import ChiTietHoatDong from './ChiTietHoatDong';
import './SinhVienDashboard.css';

const SinhVienHome = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await sinhvienService.getActivities();
      setActivities(response.data.slice(0, 5)); // Lấy 5 hoạt động gần nhất
    } catch (error) {
      console.error('Fetch activities error:', error);
    }
  };

  return (
    <div className="sinhvien-home">
      <div className="welcome-banner">
        <h1>Chào mừng đến với Hệ thống CLB & Hoạt động SV</h1>
        <p>Khám phá và tham gia các hoạt động thú vị!</p>
      </div>

      <div className="recent-activities">
        <h2>Hoạt động sắp diễn ra</h2>
        {activities.length === 0 ? (
          <p>Chưa có hoạt động nào</p>
        ) : (
          <div className="activities-preview">
            {activities.map(activity => (
              <div key={activity.id} className="activity-preview-card card">
                <h3>{activity.ten_hoat_dong}</h3>
                <p className="activity-club">{activity.ten_clb}</p>
                <p className="activity-time">
                  <FaCalendar /> {new Date(activity.thoi_gian_bat_dau).toLocaleString('vi-VN')}
                </p>
                <Link to="/sinhvien/hoat-dong" className="btn btn-primary btn-sm">
                  Xem tất cả
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SinhVienDashboard = () => {
  return (
    <div className="sinhvien-dashboard">
      <div className="sinhvien-sidebar">
        <h2>Menu</h2>
        <nav className="sinhvien-nav">
          <NavLink to="/sinhvien" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FaCalendar /> Trang chủ
          </NavLink>
          <NavLink to="/sinhvien/hoat-dong" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FaClipboardList /> Danh sách hoạt động
          </NavLink>
          <NavLink to="/sinhvien/cua-toi" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FaClipboardCheck /> Hoạt động của tôi
          </NavLink>
          <NavLink to="/sinhvien/trang-thai-dang-ky" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FaClipboardCheck /> Trạng thái đăng ký
          </NavLink>
          <NavLink to="/sinhvien/dang-ky-clb" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FaUserPlus /> Đăng ký thành viên CLB
          </NavLink>
          <NavLink to="/sinhvien/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FaComments /> Phòng chat
          </NavLink>
          <NavLink to="/sinhvien/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FaUser /> Hồ sơ cá nhân
          </NavLink>
          <NavLink to="/sinhvien/top-sinh-vien" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FaTrophy /> Top Sinh Viên
          </NavLink>
          <NavLink to="/sinhvien/thong-ke" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FaChartLine /> Thống kê
          </NavLink>
          <NavLink to="/sinhvien/danh-gia" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FaCommentDots /> Đánh giá
          </NavLink>
        </nav>
      </div>

      <div className="sinhvien-content">
        <Routes>
          <Route index element={<SinhVienHome />} />
          <Route path="hoat-dong" element={<DanhSachHoatDong />} />
          <Route path="hoat-dong/:id" element={<ChiTietHoatDong />} />
          <Route path="cua-toi" element={<HoatDongCuaToi />} />
          <Route path="trang-thai-dang-ky" element={<TrangThaiDangKy />} />
          <Route path="dang-ky-clb" element={<DangKyCLB />} />
          <Route path="chat" element={<ChatList />} />
          <Route path="chat/:roomId" element={<ChatRoom />} />
          <Route path="profile" element={<Profile />} />
          <Route path="top-sinh-vien" element={<TopSinhVien />} />
          <Route path="thong-ke" element={<ThongKe />} />
          <Route path="danh-gia" element={<DanhGia />} />
        </Routes>
      </div>
    </div>
  );
};

export default SinhVienDashboard;
