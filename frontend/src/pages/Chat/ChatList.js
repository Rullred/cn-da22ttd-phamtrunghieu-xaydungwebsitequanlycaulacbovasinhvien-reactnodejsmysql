import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chatService } from '../../services/api';
import Loading from '../../components/Loading';
import { FaComments, FaUsers, FaCalendarAlt, FaSearch, FaArrowRight, FaTrash } from 'react-icons/fa';
import './ChatList.css';

const ChatList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    syncAndFetchRooms();
  }, []);

  const syncAndFetchRooms = async () => {
    try {
      // Thử đồng bộ phòng chat trước (có thể thất bại nếu bảng chưa tồn tại)
      try {
        await chatService.syncRooms();
      } catch (syncError) {
        console.log('Sync rooms skipped:', syncError.message);
      }
      // Sau đó lấy danh sách
      const response = await chatService.getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Fetch rooms error:', error);
      // Nếu lỗi là do bảng chưa tồn tại, hiển thị danh sách rỗng
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.ten_phong.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.ma_phong.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.ten_clb.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const handleDeleteRoom = async (e, roomId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa phòng chat này?')) return;
    
    try {
      await chatService.deleteRoom(roomId);
      setRooms(rooms.filter(r => r.id !== roomId));
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const canDeleteRoom = (room) => {
    return user.loai_nguoi_dung === 'admin' || user.loai_nguoi_dung === 'chu_nhiem';
  };

  if (loading) return <Loading />;

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h1>
          <FaComments />
          Phòng chat hoạt động
        </h1>
        <p>Nhắn tin với CLB và các thành viên tham gia hoạt động</p>
      </div>

      <div className="search-box">
        <FaSearch />
        <input
          type="text"
          placeholder="Tìm kiếm phòng chat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredRooms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>Chưa có phòng chat nào</h3>
          <p>
            {searchTerm 
              ? 'Không tìm thấy phòng chat phù hợp'
              : 'Bạn sẽ được thêm vào phòng chat khi đăng ký hoạt động được duyệt'}
          </p>
        </div>
      ) : (
        <div className="rooms-list">
          {filteredRooms.map(room => {
            // Xác định đường dẫn dựa trên loại người dùng
            const chatPath = user.loai_nguoi_dung === 'sinh_vien' 
              ? `/sinhvien/chat/${room.id}` 
              : user.loai_nguoi_dung === 'chu_nhiem'
              ? `/caulacbo/chat/${room.id}`
              : `/admin/chat/${room.id}`;
            
            return (
              <div key={room.id} className="room-card" onClick={() => navigate(chatPath)}>
                <div className="room-avatar">
                  <FaComments />
                </div>
                <div className="room-info">
                  <div className="room-header">
                    <h3>{room.ten_phong}</h3>
                  </div>
                  <div className="room-meta">
                    <span className="room-code">Mã: {room.ma_phong}</span>
                    <span className="room-clb">{room.ten_clb}</span>
                  </div>
                  <div className="room-footer">
                    <span className="member-count">
                      <FaUsers /> {room.so_thanh_vien}
                    </span>
                    <span className="activity-date">
                      <FaCalendarAlt /> {new Date(room.thoi_gian_bat_dau).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className="room-actions">
                  <button className="btn-enter-room" title="Vào phòng chat">
                    <FaArrowRight />
                  </button>
                  {canDeleteRoom(room) && (
                    <button 
                      className="btn-delete-room" 
                      title="Xóa phòng"
                      onClick={(e) => handleDeleteRoom(e, room.id)}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;
