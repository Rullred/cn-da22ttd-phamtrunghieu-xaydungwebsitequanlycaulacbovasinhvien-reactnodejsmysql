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
  
  // States cho bulk select
  const [selectedPending, setSelectedPending] = useState([]);
  const [selectedParticipating, setSelectedParticipating] = useState([]);
  const [selectAllPending, setSelectAllPending] = useState(false);
  const [selectAllParticipating, setSelectAllParticipating] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    fetchData();
  }, [hoat_dong_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [regResponse, completedResponse, activitiesResponse] = await Promise.all([
        clbService.getActivityRegistrations(hoat_dong_id),
        clbService.getCompletedParticipants(hoat_dong_id),
        clbService.getActivities()
      ]);
      
      console.log('Registrations:', regResponse.data);
      console.log('Completed:', completedResponse.data);
      
      setRegistrations(regResponse.data || []);
      setCompletedList(completedResponse.data || []);
      
      // Lấy thông tin hoạt động đầy đủ từ danh sách hoạt động
      const currentActivity = activitiesResponse.data.find(a => a.id === parseInt(hoat_dong_id));
      if (currentActivity) {
        setActivity(currentActivity);
      } else if (regResponse.data && regResponse.data.length > 0) {
        // Fallback: lấy từ registration đầu tiên
        setActivity({
          ten_hoat_dong: regResponse.data[0].ten_hoat_dong
        });
      }
    } catch (error) {
      console.error('Lỗi lấy dữ liệu:', error);
      console.error('Error details:', error.response?.data);
      alert('Không thể tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handlers cho bulk select - Pending
  const handleSelectAllPending = (e) => {
    const checked = e.target.checked;
    setSelectAllPending(checked);
    if (checked) {
      setSelectedPending(pendingList.map(r => r.id));
    } else {
      setSelectedPending([]);
    }
  };

  const handleSelectPending = (id) => {
    setSelectedPending(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handlers cho bulk select - Participating
  const handleSelectAllParticipating = (e) => {
    const checked = e.target.checked;
    setSelectAllParticipating(checked);
    if (checked) {
      setSelectedParticipating(participatingList.map(r => r.id));
    } else {
      setSelectedParticipating([]);
    }
  };

  const handleSelectParticipating = (id) => {
    setSelectedParticipating(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Bulk approve
  const handleBulkApprove = async () => {
    if (selectedPending.length === 0) {
      alert('Vui lòng chọn ít nhất một đăng ký');
      return;
    }

    if (!window.confirm(`Phê duyệt ${selectedPending.length} đăng ký đã chọn?`)) {
      return;
    }

    try {
      setProcessing('bulk');
      await clbService.approveRegistrationsBulk(selectedPending);
      alert(`Đã phê duyệt thành công ${selectedPending.length} đăng ký!`);
      setSelectedPending([]);
      setSelectAllPending(false);
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể phê duyệt hàng loạt'));
    } finally {
      setProcessing(null);
    }
  };

  // Bulk confirm completion
  const handleBulkConfirm = async () => {
    if (selectedParticipating.length === 0) {
      alert('Vui lòng chọn ít nhất một sinh viên');
      return;
    }

    if (!window.confirm(`Xác nhận ${selectedParticipating.length} sinh viên đã hoàn thành?`)) {
      return;
    }

    try {
      setProcessing('bulk');
      await clbService.confirmCompletionBulk(selectedParticipating);
      alert(`Đã xác nhận hoàn thành cho ${selectedParticipating.length} sinh viên!`);
      setSelectedParticipating([]);
      setSelectAllParticipating(false);
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xác nhận hàng loạt'));
    } finally {
      setProcessing(null);
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

  const handleSendEvidenceRequest = async () => {
    if (completedList.length === 0) {
      alert('Chưa có sinh viên nào hoàn thành hoạt động');
      return;
    }

    if (!window.confirm(`Gửi yêu cầu cung cấp minh chứng cho ${completedList.length} sinh viên đã hoàn thành?`)) {
      return;
    }

    try {
      setSendingRequest(true);
      await clbService.sendEvidenceRequest(hoat_dong_id);
      alert('Đã gửi yêu cầu cung cấp minh chứng thành công! Admin sẽ xử lý yêu cầu của bạn.');
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.message);
      } else {
        alert('Lỗi: ' + (error.response?.data?.message || 'Không thể gửi yêu cầu'));
      }
    } finally {
      setSendingRequest(false);
    }
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

      {/* Thống kê tổng quan */}
      {activity && (
        <div className="activity-stats-summary" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '14px', opacity: 0.9}}>Tổng đăng ký</div>
              <div style={{fontSize: '28px', fontWeight: 'bold', marginTop: '4px'}}>
                {activity.tong_so_dang_ky || 0}
              </div>
              {activity.so_luong_toi_da > 0 && (
                <div style={{fontSize: '12px', opacity: 0.8}}>/ {activity.so_luong_toi_da} người</div>
              )}
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '14px', opacity: 0.9}}>Chờ duyệt</div>
              <div style={{fontSize: '28px', fontWeight: 'bold', marginTop: '4px'}}>
                {activity.so_cho_duyet || 0}
              </div>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '14px', opacity: 0.9}}>Đang tham gia</div>
              <div style={{fontSize: '28px', fontWeight: 'bold', marginTop: '4px'}}>
                {activity.so_dang_tham_gia || 0}
              </div>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '14px', opacity: 0.9}}>Hoàn thành</div>
              <div style={{fontSize: '28px', fontWeight: 'bold', marginTop: '4px'}}>
                {activity.so_hoan_thanh || 0}
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="section-header">
            <h3>Danh sách chờ duyệt tham gia (Lần 1)</h3>
            {selectedPending.length > 0 && (
              <button 
                className="btn-bulk-approve"
                onClick={handleBulkApprove}
                disabled={processing === 'bulk'}
              >
                <FaCheck /> Phê duyệt {selectedPending.length} đăng ký
              </button>
            )}
          </div>
          {pendingList.length === 0 ? (
            <p className="empty-message">Không có yêu cầu nào đang chờ duyệt</p>
          ) : (
            <div className="table-wrapper">
              <table className="registration-table">
                <thead>
                  <tr>
                    <th style={{width: '50px'}}>
                      <input 
                        type="checkbox" 
                        checked={selectAllPending}
                        onChange={handleSelectAllPending}
                        disabled={pendingList.length === 0}
                      />
                    </th>
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
                        <input 
                          type="checkbox"
                          checked={selectedPending.includes(reg.id)}
                          onChange={() => handleSelectPending(reg.id)}
                        />
                      </td>
                      <td>
                        <input 
                          type="checkbox"
                          checked={selectedPending.includes(reg.id)}
                          onChange={() => handleSelectPending(reg.id)}
                        />
                      </td>
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
          <div className="section-header">
            <h3>Danh sách đang tham gia (Chờ xác nhận hoàn thành - Lần 2)</h3>
            {selectedParticipating.length > 0 && (
              <button 
                className="btn-bulk-confirm"
                onClick={handleBulkConfirm}
                disabled={processing === 'bulk'}
              >
                <FaUserCheck /> Xác nhận {selectedParticipating.length} sinh viên
              </button>
            )}
          </div>
          {participatingList.length === 0 ? (
            <p className="empty-message">Chưa có sinh viên nào đang tham gia</p>
          ) : (
            <div className="table-wrapper">
              <table className="registration-table">
                <thead>
                  <tr>
                    <th style={{width: '50px'}}>
                      <input 
                        type="checkbox" 
                        checked={selectAllParticipating}
                        onChange={handleSelectAllParticipating}
                        disabled={participatingList.length === 0}
                      />
                    </th>
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
                        <input 
                          type="checkbox"
                          checked={selectedParticipating.includes(reg.id)}
                          onChange={() => handleSelectParticipating(reg.id)}
                        />
                      </td>
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
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-export" onClick={handleExport}>
                <FaFileExport /> Xuất Excel
              </button>
              <button 
                className="btn-send-request" 
                onClick={handleSendEvidenceRequest}
                disabled={sendingRequest || completedList.length === 0}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: sendingRequest || completedList.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: sendingRequest || completedList.length === 0 ? 0.6 : 1
                }}
              >
                <FaFileExport /> {sendingRequest ? 'Đang gửi...' : 'Gửi yêu cầu minh chứng'}
              </button>
            </div>
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
