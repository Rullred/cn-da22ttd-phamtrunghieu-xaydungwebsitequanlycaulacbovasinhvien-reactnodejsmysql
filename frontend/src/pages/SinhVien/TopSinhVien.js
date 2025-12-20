import { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaStar, FaAward, FaUser, FaGraduationCap } from 'react-icons/fa';
import api from '../../services/api';
import './TopSinhVien.css';

// Hàm xử lý URL avatar
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  // Nếu đã là URL đầy đủ
  if (avatarPath.startsWith('http')) return avatarPath;
  // Nếu là đường dẫn tương đối, thêm base URL
  return `http://localhost:5000${avatarPath}`;
};

const TopSinhVien = () => {
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalPoints: 0,
    totalActivities: 0
  });

  useEffect(() => {
    fetchTopStudents();
  }, []);

  const fetchTopStudents = async () => {
    try {
      const response = await api.get('/sinhvien/top-students');
      setTopStudents(response.data.students || []);
      setStats(response.data.stats || {
        totalStudents: 0,
        totalPoints: 0,
        totalActivities: 0
      });
      setLoading(false);
    } catch (error) {
      console.error('Lỗi lấy top sinh viên:', error);
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy className="rank-icon gold" />;
    if (rank === 2) return <FaMedal className="rank-icon silver" />;
    if (rank === 3) return <FaMedal className="rank-icon bronze" />;
    return <span className="rank-number">{rank}</span>;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="modern-spinner"></div>
      </div>
    );
  }

  return (
    <div className="top-sinhvien-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <FaTrophy size={32} />
          </div>
          <div>
            <h1>Top Sinh Viên Xuất Sắc</h1>
            <p>Bảng xếp hạng sinh viên theo điểm rèn luyện</p>
          </div>
        </div>
      </div>

      <div className="top-students-content">
        <div className="stats-overview">
          <div className="stat-card">
            <FaGraduationCap className="stat-icon blue" />
            <div className="stat-info">
              <h3>{stats.totalStudents}</h3>
              <p>Sinh viên có điểm</p>
            </div>
          </div>
          <div className="stat-card">
            <FaStar className="stat-icon gold" />
            <div className="stat-info">
              <h3>{stats.totalPoints}</h3>
              <p>Tổng điểm rèn luyện</p>
            </div>
          </div>
          <div className="stat-card">
            <FaAward className="stat-icon green" />
            <div className="stat-info">
              <h3>{stats.totalActivities}</h3>
              <p>Hoạt động hoàn thành</p>
            </div>
          </div>
        </div>

        <div className="ranking-section">
          <div className="section-header">
            <h2><FaTrophy /> Bảng Xếp Hạng Top 50</h2>
          </div>

          {topStudents.length === 0 ? (
            <div className="empty-state">
              <FaUser size={48} className="empty-icon" />
              <h3>Chưa có dữ liệu</h3>
              <p>Chưa có sinh viên nào hoàn thành hoạt động</p>
            </div>
          ) : (
            <div className="ranking-table-wrapper">
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th>Hạng</th>
                    <th>Sinh viên</th>
                    <th>MSSV</th>
                    <th>Lớp</th>
                    <th>Điểm rèn luyện</th>
                    <th>Số hoạt động</th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((student, index) => (
                    <tr key={student.id} className={getRankClass(index + 1)}>
                      <td className="rank-cell">
                        {getRankIcon(index + 1)}
                      </td>
                      <td className="student-cell">
                        <div className="student-info">
                          <div className="student-avatar">
                            {student.anh_dai_dien ? (
                              <img 
                                src={getAvatarUrl(student.anh_dai_dien)} 
                                alt={student.ho_ten}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span className="avatar-fallback" style={{ display: student.anh_dai_dien ? 'none' : 'flex' }}>
                              <FaUser />
                            </span>
                          </div>
                          <span className="student-name">{student.ho_ten}</span>
                        </div>
                      </td>
                      <td>{student.ma_sinh_vien}</td>
                      <td>{student.lop || '-'}</td>
                      <td className="points-cell">
                        <span className="points-badge">
                          <FaStar /> {student.tong_diem_ren_luyen || 0}
                        </span>
                      </td>
                      <td className="activities-cell">{student.so_hoat_dong || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopSinhVien;
