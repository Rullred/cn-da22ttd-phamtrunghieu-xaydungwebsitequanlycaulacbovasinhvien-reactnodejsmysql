import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clbService } from '../../services/api';
import { FaCheck, FaTimes, FaUserCheck, FaFileExport, FaArrowLeft, FaUser, FaIdCard, FaCalendar } from 'react-icons/fa';
import Loading from '../../components/Loading';
import './DuyetThamGiaHoatDong.css';

const DuyetThamGiaHoatDong = () => {
  const { hoat_dong_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // pending, participating, completed
  const [processing, setProcessing] = useState(null);
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    fetchData();
  }, [hoat_dong_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [regResponse, completedResponse] = await Promise.all([
        clbService.getActivityRegistrations(hoat_dong_id),
        clbService.getCompletedParticipants(hoat_dong_id)
      ]);
      
      console.log('Registrations:', regResponse.data);
      console.log('Completed:', completedResponse.data);
      
      setRegistrations(regResponse.data || []);
      setCompletedList(completedResponse.data || []);
      
      // Lấy thông tin hoạt động từ registration đầu tiên
      if (regResponse.data && regResponse.data.length > 0) {
        setActivity({
          ten_hoat_dong: regResponse.data[0].ten_hoat_dong
        });
      } else {
        // Nếu không có registration, fetch thông tin hoạt động riêng
        const activities = await clbService.getActivities();
        const currentActivity = activities.data.find(a => a.id === parseInt(hoat_dong_id));
        if (currentActivity) {
          setActivity({ ten_hoat_dong: currentActivity.ten_hoat_dong });
        }
      }
    } catch (error) {
      console.error('Lỗi lấy dữ liệu:', error);
      console.error('Error details:', error.response?.data);
      alert('Không thể tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (processing) return;
    
    if (!window.confirm('Duyệt cho sinh viên này tham gia hoạt động?')) {
      return;
    }

    try {
      setProcessing(id);
      await clbService.approveRegistration(id);
      alert('Đã duyệt thành công!');
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể duyệt'));
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    if (processing) return;
    
    const ly_do = prompt('Lý do từ chối (tùy chọn):');
    if (ly_do === null) return; // User clicked cancel

    try {
      setProcessing(id);
      await clbService.rejectRegistration(id, ly_do);
      alert('Đã từ chối!');
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể từ chối'));
    } finally {
      setProcessing(null);
    }
  };

  const handleConfirmCompletion = async (id) => {
    if (processing) return;
    
    if (!window.confirm('Xác nhận sinh viên này đã hoàn thành hoạt động?')) {
      return;
    }

    try {
      setProcessing(id);
      await clbService.confirmCompletion(id);
      alert('Đã xác nhận hoàn thành!');
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xác nhận'));
    } finally {
      setProcessing(null);
    }
  };

  const handleExport = () => {
    if (completedList.length === 0) {
      alert('Chưa có sinh viên nào hoàn thành hoạt động');
      return;
    }

    // Tạo CSV content
    const headers = ['STT', 'Họ tên', 'MSSV', 'Lớp', 'Khoa', 'Khóa', 'Ngày đăng ký', 'Ngày duyệt lần 1', 'Ngày hoàn thành'];
    const rows = completedList.map((item, index) => [
      index + 1,
      item.ho_ten,
      item.ma_sinh_vien,
      item.lop || '',
      item.khoa || '',
      item.khoa_hoc ? `Khóa ${item.khoa_hoc}` : '',
      new Date(item.ngay_dang_ky).toLocaleString('vi-VN'),
      new Date(item.ngay_duyet_lan_1).toLocaleString('vi-VN'),
      new Date(item.ngay_duyet_lan_2).toLocaleString('vi-VN')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Thêm BOM cho UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Danh_sach_hoan_thanh_${hoat_dong_id}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingList = registrations.filter(r => r.trang_thai === 'cho_duyet');
  const participatingList = registrations.filter(r => r.trang_thai === 'dang_tham_gia');

  if (loading) return <Loading />;

  return (
    <div className="duyet-tham-gia-container">
      <div className="duyet-header">
        <button className="btn-back" onClick={() => navigate('/caulacbo/hoat-dong')}>
          <FaArrowLeft /> Quay lại
        </button>
        <h1>Quản lý tham gia hoạt động</h1>
        {activity && <h2>{activity.ten_hoat_dong}</h2>}
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Chờ duyệt ({pendingList.length})
        </button>
        <button 
          className={`tab ${activeTab === 'participating' ? 'active' : ''}`}
          onClick={() => setActiveTab('participating')}
        >
          Đang tham gia ({participatingList.length})
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Đã hoàn thành ({completedList.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="list-section">
          <h3>Danh sách chờ duyệt tham gia (Lần 1)</h3>
          {pendingList.length === 0 ? (
            <p className="empty-message">Không có yêu cầu nào đang chờ duyệt</p>
          ) : (
            <div className="table-wrapper">
              <table className="registration-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Họ tên</th>
                    <th>MSSV</th>
                    <th>Lớp</th>
                    <th>Khoa</th>
                    <th>Ngày đăng ký</th>
                    <th>Ghi chú</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingList.map(reg => (
                    <tr key={reg.id}>
                      <td>
                        <img 
                          src={reg.anh_dai_dien || '/avtar.png'} 
                          alt={reg.ho_ten}
                          className="avatar"
                          onError={(e) => e.target.src = '/avtar.png'}
                        />
                      </td>
                      <td><strong>{reg.ho_ten}</strong></td>
                      <td>{reg.ma_sinh_vien}</td>
                      <td>{reg.lop || '-'}</td>
                      <td>{reg.khoa || '-'}</td>
                      <td>{new Date(reg.ngay_dang_ky).toLocaleString('vi-VN')}</td>
                      <td>{reg.ghi_chu || '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-approve"
                            onClick={() => handleApprove(reg.id)}
                            disabled={processing === reg.id}
                          >
                            <FaCheck /> Duyệt
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handleReject(reg.id)}
                            disabled={processing === reg.id}
                          >
                            <FaTimes /> Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'participating' && (
        <div className="list-section">
          <h3>Danh sách đang tham gia (Chờ xác nhận hoàn thành - Lần 2)</h3>
          {participatingList.length === 0 ? (
            <p className="empty-message">Chưa có sinh viên nào đang tham gia</p>
          ) : (
            <div className="table-wrapper">
              <table className="registration-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Họ tên</th>
                    <th>MSSV</th>
                    <th>Lớp</th>
                    <th>Khoa</th>
                    <th>Ngày duyệt lần 1</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {participatingList.map(reg => (
                    <tr key={reg.id}>
                      <td>
                        <img 
                          src={reg.anh_dai_dien || '/avtar.png'} 
                          alt={reg.ho_ten}
                          className="avatar"
                          onError={(e) => e.target.src = '/avtar.png'}
                        />
                      </td>
                      <td><strong>{reg.ho_ten}</strong></td>
                      <td>{reg.ma_sinh_vien}</td>
                      <td>{reg.lop || '-'}</td>
                      <td>{reg.khoa || '-'}</td>
                      <td>{new Date(reg.ngay_duyet_lan_1 || reg.ngay_duyet).toLocaleString('vi-VN')}</td>
                      <td>
                        <button 
                          className="btn-confirm"
                          onClick={() => handleConfirmCompletion(reg.id)}
                          disabled={processing === reg.id}
                        >
                          <FaUserCheck /> Xác nhận hoàn thành
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="list-section">
          <div className="section-header">
            <h3>Danh sách đã hoàn thành hoạt động</h3>
            <button className="btn-export" onClick={handleExport}>
              <FaFileExport /> Xuất Excel
            </button>
          </div>
          
          {completedList.length === 0 ? (
            <p className="empty-message">Chưa có sinh viên nào hoàn thành hoạt động</p>
          ) : (
            <div className="table-wrapper">
              <table className="registration-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Ảnh</th>
                    <th>Họ tên</th>
                    <th>MSSV</th>
                    <th>Lớp</th>
                    <th>Khoa</th>
                    <th>Khóa</th>
                    <th>Ngày đăng ký</th>
                    <th>Ngày duyệt lần 1</th>
                    <th>Ngày hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {completedList.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        <img 
                          src={item.anh_dai_dien || '/avtar.png'} 
                          alt={item.ho_ten}
                          className="avatar"
                          onError={(e) => e.target.src = '/avtar.png'}
                        />
                      </td>
                      <td><strong>{item.ho_ten}</strong></td>
                      <td>{item.ma_sinh_vien}</td>
                      <td>{item.lop || '-'}</td>
                      <td>{item.khoa || '-'}</td>
                      <td>{item.khoa_hoc ? `Khóa ${item.khoa_hoc}` : '-'}</td>
                      <td>{new Date(item.ngay_dang_ky).toLocaleDateString('vi-VN')}</td>
                      <td>{new Date(item.ngay_duyet_lan_1).toLocaleDateString('vi-VN')}</td>
                      <td>{new Date(item.ngay_duyet_lan_2).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DuyetThamGiaHoatDong;
