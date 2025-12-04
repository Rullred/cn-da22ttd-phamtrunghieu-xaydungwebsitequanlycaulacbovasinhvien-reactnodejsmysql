import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CreateProfile from './pages/CreateProfile';
import WaitingApproval from './pages/WaitingApproval';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CLBDashboard from './pages/CLB/CLBDashboard';
import SinhVienDashboard from './pages/SinhVien/SinhVienDashboard';
import ThongBao from './pages/ThongBao';
import { authService, thongbaoService } from './services/api';
import socketService from './services/socket';
import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.loai_nguoi_dung)) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Kết nối socket
      socketService.connect(response.data.id);
      
      // Lắng nghe thông báo real-time
      socketService.on('notification', (data) => {
        fetchUnreadCount();
      });
      
      fetchUnreadCount();
    } catch (error) {
      console.error('Fetch user error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const fetchUnreadCount = async () => {
    try {
      const response = await thongbaoService.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {user && <Navbar user={user} unreadCount={unreadCount} />}
        
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="/waiting-approval" element={<WaitingApproval />} />
            
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/caulacbo/*" 
              element={
                <ProtectedRoute allowedRoles={['chu_nhiem']}>
                  <CLBDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/sinhvien/*" 
              element={
                <ProtectedRoute allowedRoles={['sinh_vien']}>
                  <SinhVienDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/thongbao" 
              element={
                <ProtectedRoute>
                  <ThongBao updateUnreadCount={fetchUnreadCount} />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
