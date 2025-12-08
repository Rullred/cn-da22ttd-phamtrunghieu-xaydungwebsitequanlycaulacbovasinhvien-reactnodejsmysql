import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { sinhvienService } from '../../services/api';
import { FaCalendar, FaClipboardList, FaUser, FaTrophy, FaChartLine, FaCommentDots } from 'react-icons/fa';
import DanhSachHoatDong from './DanhSachHoatDong';
import HoatDongCuaToi from './HoatDongCuaToi';
import Profile from './Profile';
import TopSinhVien from './TopSinhVien';
import ThongKe from './ThongKe';
import DanhGia from './DanhGia';
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
          <Link to="/sinhvien" className="nav-item">
            <FaCalendar /> Trang chủ
          </Link>
          <Link to="/sinhvien/hoat-dong" className="nav-item">
            <FaClipboardList /> Danh sách hoạt động
          </Link>
          <Link to="/sinhvien/cua-toi" className="nav-item">
            <FaClipboardList /> Hoạt động của tôi
          </Link>
          <Link to="/sinhvien/profile" className="nav-item">
            <FaUser /> Hồ sơ cá nhân
          </Link>
          <Link to="/sinhvien/top-sinh-vien" className="nav-item">
            <FaTrophy /> Top Sinh Viên
          </Link>
          <Link to="/sinhvien/thong-ke" className="nav-item">
            <FaChartLine /> Thống kê
          </Link>
          <Link to="/sinhvien/danh-gia" className="nav-item">
            <FaCommentDots /> Đánh giá
          </Link>
        </nav>
      </div>

      <div className="sinhvien-content">
        <Routes>
          <Route index element={<SinhVienHome />} />
          <Route path="hoat-dong" element={<DanhSachHoatDong />} />
          <Route path="cua-toi" element={<HoatDongCuaToi />} />
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
