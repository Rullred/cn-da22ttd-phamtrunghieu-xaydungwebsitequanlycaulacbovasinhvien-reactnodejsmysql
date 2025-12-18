import React, { useState, useEffect } from 'react';
import { thongbaoService } from '../services/api';
import Loading from '../components/Loading';
import { 
  FaBell, FaCheck, FaTrash, FaCheckCircle, FaTimesCircle, 
  FaCalendarCheck, FaUserCheck, FaUserTimes, FaClipboardCheck,
  FaClipboardList, FaExclamationCircle, FaCheckDouble
} from 'react-icons/fa';
import './ThongBao.css';

const ThongBao = ({ updateUnreadCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await thongbaoService.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await thongbaoService.markAsRead(id);
      fetchNotifications();
      if (updateUnreadCount) updateUnreadCount();
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await thongbaoService.markAllAsRead();
      fetchNotifications();
      if (updateUnreadCount) updateUnreadCount();
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await thongbaoService.deleteNotification(id);
      fetchNotifications();
      if (updateUnreadCount) updateUnreadCount();
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  const getNotificationStyle = (type) => {
    const styles = {
      'tai_khoan_duyet': { icon: FaCheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Tài khoản' },
      'tai_khoan_tu_choi': { icon: FaTimesCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Tài khoản' },
      'hoat_dong_moi': { icon: FaCalendarCheck, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', label: 'Hoạt động mới' },
      'dang_ky_thanh_cong': { icon: FaClipboardCheck, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', label: 'Đăng ký' },
      'duyet_thanh_vien_clb': { icon: FaUserCheck, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Thành viên CLB' },
      'tu_choi_thanh_vien_clb': { icon: FaUserTimes, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Thành viên CLB' },
      'duyet_hoat_dong': { icon: FaCheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Hoạt động' },
      'tu_choi_hoat_dong': { icon: FaTimesCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Hoạt động' },
      'nho_hoat_dong': { icon: FaExclamationCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Nhắc nhở' },
    };
    return styles[type] || { icon: FaBell, color: '#667eea', bg: 'rgba(102, 126, 234, 0.1)', label: 'Thông báo' };
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.da_doc;
    if (filter === 'read') return n.da_doc;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.da_doc).length;

  if (loading) return <Loading />;

  return (
    <div className="thongbao-page">
      {/* Header */}
      <div className="thongbao-header">
        <div className="header-left">
          <div className="header-icon">
            <FaBell />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </div>
          <div className="header-text">
            <h1>Thông báo</h1>
            <p>Quản lý tất cả thông báo của bạn</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn-mark-all">
            <FaCheckDouble />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả ({notifications.length})
        </button>
        <button 
          className={`tab ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Chưa đọc ({unreadCount})
        </button>
        <button 
          className={`tab ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Đã đọc ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>Không có thông báo</h3>
          <p>{filter === 'unread' ? 'Bạn đã đọc tất cả thông báo' : 'Chưa có thông báo nào'}</p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map(notification => {
            const style = getNotificationStyle(notification.loai_thong_bao);
            const IconComponent = style.icon;
            
            return (
              <div 
                key={notification.id} 
                className={`notification-card ${!notification.da_doc ? 'unread' : ''}`}
              >
                <div className="notification-indicator" style={{ background: style.color }}></div>
                
                <div className="notification-icon" style={{ background: style.bg, color: style.color }}>
                  <IconComponent />
                </div>
                
                <div className="notification-body">
                  <div className="notification-meta">
                    <span className="notification-label" style={{ background: style.bg, color: style.color }}>
                      {style.label}
                    </span>
                    <span className="notification-time">{formatTime(notification.created_at)}</span>
                  </div>
                  <h3 className="notification-title">{notification.tieu_de}</h3>
                  <p className="notification-content">{notification.noi_dung}</p>
                </div>
                
                <div className="notification-actions">
                  {!notification.da_doc && (
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)} 
                      className="btn-action btn-read"
                      title="Đánh dấu đã đọc"
                    >
                      <FaCheck />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(notification.id)} 
                    className="btn-action btn-delete"
                    title="Xóa thông báo"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThongBao;
