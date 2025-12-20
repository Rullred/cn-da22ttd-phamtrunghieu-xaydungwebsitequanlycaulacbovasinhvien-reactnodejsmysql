import React, { useState, useEffect } from 'react';
import { sinhvienService } from '../../services/api';
import Loading from '../../components/Loading';
import { FaUsers, FaCalendarAlt, FaUserTie, FaSearch, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import './DangKyCLB.css';

const DangKyCLB = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [joiningClub, setJoiningClub] = useState(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await sinhvienService.getClubs();
      setClubs(response.data);
    } catch (error) {
      console.error('Fetch clubs error:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách CLB' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clbId, tenClb) => {
    if (!window.confirm(`Bạn có chắc muốn đăng ký làm thành viên CLB "${tenClb}"?`)) {
      return;
    }

    setJoiningClub(clbId);
    try {
      await sinhvienService.joinClub(clbId);
      setMessage({ 
        type: 'success', 
        text: `Đã gửi yêu cầu tham gia CLB "${tenClb}" thành công! Vui lòng chờ chủ nhiệm phê duyệt.` 
      });
      fetchClubs(); // Refresh để cập nhật trạng thái
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Không thể gửi yêu cầu tham gia' 
      });
    } finally {
      setJoiningClub(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'da_duyet':
        return <span className="status-badge approved"><FaCheckCircle /> Đã là thành viên</span>;
      case 'cho_duyet':
        return <span className="status-badge pending"><FaClock /> Đang chờ duyệt</span>;
      case 'tu_choi':
        return <span className="status-badge rejected"><FaTimesCircle /> Đã bị từ chối</span>;
      default:
        return null;
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.ten_clb.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (club.mo_ta && club.mo_ta.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <Loading />;

  return (
    <div className="dang-ky-clb">
      <div className="page-header">
        <h1>Đăng ký thành viên CLB</h1>
        <p>Tham gia các câu lạc bộ để kết nối và phát triển bản thân</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm CLB theo tên hoặc mô tả..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredClubs.length === 0 ? (
        <div className="empty-state card">
          <FaUsers className="empty-icon" />
          <p>Không tìm thấy câu lạc bộ nào</p>
        </div>
      ) : (
        <div className="clubs-grid">
          {filteredClubs.map(club => (
            <div key={club.id} className="club-card card">
              <div className="club-logo">
                {club.logo ? (
                  <img src={club.logo} alt={club.ten_clb} />
                ) : (
                  <div className="logo-placeholder">
                    <FaUsers />
                  </div>
                )}
              </div>

              <div className="club-info">
                <h3>{club.ten_clb}</h3>
                <p className="club-description">{club.mo_ta || 'Chưa có mô tả'}</p>

                <div className="club-details">
                  {club.chu_nhiem_name && (
                    <div className="detail-item">
                      <FaUserTie />
                      <span>Chủ nhiệm: {club.chu_nhiem_name}</span>
                    </div>
                  )}
                  {club.ngay_thanh_lap && (
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span>Thành lập: {new Date(club.ngay_thanh_lap).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <FaUsers />
                    <span>Thành viên: {club.so_thanh_vien || 0} người</span>
                  </div>
                </div>
              </div>

              <div className="club-footer">
                {club.membership_status ? (
                  getStatusBadge(club.membership_status)
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleJoinClub(club.id, club.ten_clb)}
                    disabled={joiningClub === club.id}
                  >
                    {joiningClub === club.id ? 'Đang gửi...' : '📝 Đăng ký thành viên'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DangKyCLB;
