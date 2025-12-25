import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatService } from '../../services/api';
import socketService from '../../services/socket';
import Loading from '../../components/Loading';
import { 
  FaPaperPlane, FaImage, FaSmile, FaArrowLeft, FaUsers, 
  FaCalendarAlt, FaMapMarkerAlt, FaTimes, FaTrash, FaUserMinus, FaUser 
} from 'react-icons/fa';
import './ChatRoom.css';

// Base URL cho ảnh
const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Emoji picker đơn giản
const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🔥', '🎉', '👏', '💪', '🙏', '✅', '❌'];

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  const userType = user.loai_nguoi_dung;

  // Xác định đường dẫn quay lại dựa trên loại người dùng
  const backPath = userType === 'sinh_vien' 
    ? '/sinhvien/chat' 
    : userType === 'chu_nhiem' 
    ? '/caulacbo/chat' 
    : '/admin/chat';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRoomDetail = useCallback(async () => {
    try {
      const response = await chatService.getRoomDetail(roomId);
      setRoom(response.data.room);
      setMembers(response.data.members);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Fetch room error:', error);
      alert('Không thể tải phòng chat');
      navigate(backPath);
    } finally {
      setLoading(false);
    }
  }, [roomId, navigate, backPath]);

  useEffect(() => {
    fetchRoomDetail();

    // Join socket room
    socketService.emit('join_room', roomId);

    // Listen for new messages
    socketService.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing
    socketService.on('user_typing', (data) => {
      setTypingUsers(prev => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    socketService.on('user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    // Listen for room closed
    socketService.on('room_closed', () => {
      alert('Phòng chat đã bị đóng');
      navigate(backPath);
    });

    // Listen for member kicked
    socketService.on('member_kicked', (data) => {
      if (String(data.memberId) === String(userId)) {
        alert('Bạn đã bị chủ nhiệm câu lạc bộ mời ra khỏi nhóm chat này!');
        navigate(backPath);
      } else {
        // Cập nhật danh sách thành viên
        setMembers(prev => prev.filter(m => String(m.nguoi_dung_id) !== String(data.memberId)));
      }
    });

    // Listen for notification (kicked from chat)
    socketService.on('notification', (data) => {
      if (data.type === 'kicked_from_chat' && String(data.roomId) === String(roomId)) {
        alert(data.message);
        navigate(backPath);
      }
    });

    return () => {
      socketService.emit('leave_room', roomId);
      socketService.off('new_message');
      socketService.off('user_typing');
      socketService.off('user_stop_typing');
      socketService.off('room_closed');
      socketService.off('member_kicked');
      socketService.off('notification');
    };
  }, [roomId, fetchRoomDetail, navigate, userId, backPath]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = () => {
    socketService.emit('typing', {
      roomId,
      userId: userId,
      userName: user.ho_ten || user.email
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit('stop_typing', { roomId, userId: userId });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !imagePreview) return;

    setSending(true);
    try {
      if (imagePreview) {
        const formData = new FormData();
        formData.append('image', imagePreview.file);
        const response = await chatService.sendImage(roomId, formData);
        console.log('Image sent:', response.data);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        await chatService.sendMessage(roomId, newMessage.trim());
      }
      setNewMessage('');
      socketService.emit('stop_typing', { roomId, userId: userId });
    } catch (error) {
      console.error('Send error:', error);
      alert('Lỗi gửi tin nhắn: ' + (error.response?.data?.message || 'Đã xảy ra lỗi!'));
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Hình ảnh không được vượt quá 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview({ file, preview: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmoji(false);
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm('Bạn có chắc muốn đóng phòng chat này?')) return;
    
    try {
      await chatService.deleteRoom(roomId);
      navigate(backPath);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleKickMember = async (memberId, memberName) => {
    if (!window.confirm(`Bạn có chắc muốn kick "${memberName}" khỏi phòng chat?`)) return;
    
    try {
      await chatService.kickMember(roomId, memberId);
      setMembers(prev => prev.filter(m => m.nguoi_dung_id !== memberId));
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  // Kiểm tra quyền kick (admin hoặc chủ nhiệm)
  const canKickMember = userType === 'admin' || userType === 'chu_nhiem';

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const shouldShowDate = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    return currentDate !== prevDate;
  };

  const canDeleteRoom = userType === 'admin' || 
    members.find(m => m.nguoi_dung_id === userId && m.vai_tro === 'chu_nhiem');

  if (loading) return <Loading />;

  return (
    <div className="chat-room-container">
      {/* Header */}
      <div className="chat-header">
        <button className="btn-back" onClick={() => navigate(backPath)}>
          <FaArrowLeft />
        </button>
        <div className="chat-info">
          <h2>{room?.ten_phong}</h2>
          <span className="room-code">Mã phòng: {room?.ma_phong}</span>
        </div>
        <div className="chat-actions">
          <button className="btn-members" onClick={() => setShowMembers(true)}>
            <FaUsers />
            <span>{members.length}</span>
          </button>
          {canDeleteRoom && (
            <button className="btn-delete" onClick={handleDeleteRoom}>
              <FaTrash />
            </button>
          )}
        </div>
      </div>

      {/* Activity Info */}
      <div className="activity-info-bar">
        <div className="info-item">
          <FaCalendarAlt />
          <span>{new Date(room?.thoi_gian_bat_dau).toLocaleString('vi-VN')}</span>
        </div>
        <div className="info-item">
          <FaMapMarkerAlt />
          <span>{room?.dia_diem}</span>
        </div>
        <span className="clb-name">{room?.ten_clb}</span>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((msg, index) => (
          <React.Fragment key={msg.id}>
            {shouldShowDate(msg, messages[index - 1]) && (
              <div className="date-divider">
                <span>{formatDate(msg.created_at)}</span>
              </div>
            )}
            <div className={`message ${msg.nguoi_gui_id === userId ? 'own' : ''}`}>
              {msg.nguoi_gui_id !== userId && (
                <div className="message-avatar">
                  <FaUser />
                </div>
              )}
              <div className="message-content">
                {msg.nguoi_gui_id !== userId && (
                  <span className="sender-name">
                    {msg.ho_ten}
                    {msg.loai_nguoi_dung === 'chu_nhiem' && <span className="role-badge cn">CN</span>}
                    {msg.loai_nguoi_dung === 'admin' && <span className="role-badge admin">Admin</span>}
                  </span>
                )}
                {msg.loai_tin_nhan === 'image' ? (
                  <img 
                    src={`${BASE_URL}${msg.hinh_anh}`} 
                    alt="Hình ảnh" 
                    className="message-image" 
                    onError={(e) => {
                      console.log('Image load error:', msg.hinh_anh);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <p>{msg.noi_dung}</p>
                )}
                <span className="message-time">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.map(u => u.userName).join(', ')} đang nhập...
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview.preview} alt="Preview" />
          <button onClick={() => setImagePreview(null)}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Input */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <div className="input-actions">
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            <FaImage />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            hidden
          />
          <button type="button" onClick={() => setShowEmoji(!showEmoji)}>
            <FaSmile />
          </button>
        </div>
        
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Nhập tin nhắn..."
          disabled={sending}
        />
        
        <button type="submit" className="btn-send" disabled={sending || (!newMessage.trim() && !imagePreview)}>
          <FaPaperPlane />
        </button>

        {/* Emoji Picker */}
        {showEmoji && (
          <div className="emoji-picker">
            {EMOJIS.map(emoji => (
              <button key={emoji} type="button" onClick={() => handleEmojiSelect(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Members Modal */}
      {showMembers && (
        <div className="modal-overlay" onClick={() => setShowMembers(false)}>
          <div className="members-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thành viên ({members.length})</h3>
              <button onClick={() => setShowMembers(false)}><FaTimes /></button>
            </div>
            <div className="members-list">
              {members.map(member => (
                <div key={member.id} className="member-item">
                  <div className="member-avatar">
                    <FaUser />
                  </div>
                  <div className="member-info">
                    <span className="member-name">{member.ho_ten}</span>
                    <span className="member-role">
                      {member.vai_tro === 'chu_nhiem' && 'Chủ nhiệm CLB'}
                      {member.vai_tro === 'admin' && 'Quản trị viên'}
                      {member.vai_tro === 'sinh_vien' && 'Sinh viên'}
                    </span>
                  </div>
                  {/* Nút kick - chỉ hiện cho admin/chủ nhiệm và không kick được admin/chủ nhiệm */}
                  {canKickMember && member.vai_tro === 'sinh_vien' && member.nguoi_dung_id !== userId && (
                    <button 
                      className="btn-kick-member"
                      onClick={() => handleKickMember(member.nguoi_dung_id, member.ho_ten)}
                      title="Kick khỏi phòng"
                    >
                      <FaUserMinus />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
