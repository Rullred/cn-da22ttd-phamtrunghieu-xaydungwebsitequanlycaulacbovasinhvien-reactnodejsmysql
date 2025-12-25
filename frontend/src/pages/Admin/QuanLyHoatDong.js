import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import * as XLSX from 'xlsx';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaCheckCircle,
  FaListAlt,
  FaUserCheck,
  FaFileExcel,
  FaSearch,
  FaUniversity,
  FaTrash
} from 'react-icons/fa';
import './QuanLyHoatDong.css';

const QuanLyHoatDong = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filter, setFilter] = useState('all'); // all, dang_tham_gia, hoan_thanh

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await adminService.getMyActivities();
      setActivities(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi lấy danh sách hoạt động:', error);
      setLoading(false);
    }
  };

  const fetchRegistrations = async (activityId) => {
    try {
      const response = await adminService.getActivityRegistrations(activityId);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Lỗi lấy danh sách đăng ký:', error);
    }
  };

  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity);
    setSelectedIds([]);
    fetchRegistrations(activity.id);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const filteredRegs = getFilteredRegistrations();
      const pendingIds = filteredRegs
        .filter(r => r.trang_thai === 'dang_tham_gia')
        .map(r => r.id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirmOne = async (id) => {
    if (!window.confirm('Xác nhận sinh viên này đã hoàn thành hoạt động?')) return;
    
    try {
      await adminService.confirmCompletion(id);
      alert('Xác nhận thành công!');
      fetchRegistrations(selectedActivity.id);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xác nhận'));
    }
  };

  const handleConfirmBulk = async () => {
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất một sinh viên!');
      return;
    }
    
    if (!window.confirm(`Xác nhận ${selectedIds.length} sinh viên đã hoàn thành hoạt động?`)) return;
    
    try {
      await adminService.confirmCompletionBulk(selectedIds);
      alert(`Đã xác nhận ${selectedIds.length} sinh viên!`);
      setSelectedIds([]);
      fetchRegistrations(selectedActivity.id);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xác nhận'));
    }
  };

  const handleDeleteActivity = async (activity) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hoạt động "${activity.ten_hoat_dong}"?\n\nLưu ý: Không thể xóa nếu đã có sinh viên hoàn thành.`)) {
      return;
    }
    
    try {
      await adminService.deleteActivity(activity.id);
      alert('Đã xóa hoạt động thành công!');
      
      // Nếu đang xem hoạt động này thì reset
      if (selectedActivity?.id === activity.id) {
        setSelectedActivity(null);
        setRegistrations([]);
      }
      
      // Refresh danh sách
      fetchActivities();
    } catch (error) {
      alert('Lỗi xóa hoạt động: ' + (error.response?.data?.message || 'Vui lòng thử lại'));
    }
  };

  const getFilteredRegistrations = () => {
    if (filter === 'all') return registrations;
    return registrations.filter(r => r.trang_thai === filter);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'dang_tham_gia':
        return <span className="badge badge-info">Đang tham gia</span>;
      case 'hoan_thanh':
        return <span className="badge badge-success">Hoàn thành</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  // Xuất danh sách sinh viên hoàn thành ra Excel
  const handleExportExcel = () => {
    const completedRegs = registrations.filter(r => r.trang_thai === 'hoan_thanh');
    
    if (completedRegs.length === 0) {
      alert('Chưa có sinh viên nào hoàn thành hoạt động này!');
      return;
    }

    // Chuẩn bị dữ liệu cho Excel
    const excelData = completedRegs.map((reg, index) => ({
      'STT': index + 1,
      'MSSV': reg.ma_sinh_vien,
      'Họ và tên': reg.ho_ten,
      'Lớp': reg.lop || '',
      'Khoa': reg.khoa || '',
      'Ngày đăng ký': formatDateTime(reg.ngay_dang_ky),
      'Ngày hoàn thành': formatDateTime(reg.ngay_duyet_lan_2),
      'Trạng thái': 'Hoàn thành'
    }));

    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Điều chỉnh độ rộng cột
    ws['!cols'] = [
      { wch: 5 },   // STT
      { wch: 15 },  // MSSV
      { wch: 25 },  // Họ tên
      { wch: 15 },  // Lớp
      { wch: 30 },  // Khoa
      { wch: 20 },  // Ngày đăng ký
      { wch: 20 },  // Ngày hoàn thành
      { wch: 15 }   // Trạng thái
    ];

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách hoàn thành');

    // Tạo tên file
    const fileName = `DS_HoanThanh_${selectedActivity.ten_hoat_dong.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`;

    // Xuất file
    XLSX.writeFile(wb, fileName);
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="modern-spinner"></div>
      </div>
    );
  }

  return (
    <div className="quan-ly-hoat-dong-container">
      <div className="page-header-section">
        <div>
          <h1 className="page-title-main">Quản lý hoạt động</h1>
          <p className="page-subtitle-main">Quản lý các hoạt động do Admin tạo và duyệt sinh viên hoàn thành</p>
        </div>
      </div>

      <div className="content-grid">
        {/* Danh sách hoạt động */}
        <div className="activities-panel glass-card">
          <div className="panel-header">
            <FaListAlt className="panel-icon" />
            <h2>Hoạt động của tôi</h2>
          </div>
          
          {activities.length === 0 ? (
            <div className="empty-state-small">
              <p>Chưa có hoạt động nào</p>
            </div>
          ) : (
            <div className="activities-list">
              {activities.map(activity => (
                <div 
                  key={activity.id} 
                  className={`activity-item ${selectedActivity?.id === activity.id ? 'active' : ''}`}
                >
                  <div 
                    className="activity-item-content"
                    onClick={() => handleSelectActivity(activity)}
                  >
                    <div className="activity-item-header">
                      <h3>{activity.ten_hoat_dong}</h3>
                      <span className={`status-dot ${activity.trang_thai}`}></span>
                    </div>
                    <div className="activity-item-info">
                      <span><FaUniversity /> {activity.don_vi_phu_trach}</span>
                      <span><FaCalendarAlt /> {formatDate(activity.thoi_gian_bat_dau)}</span>
                    </div>
                    <div className="activity-item-stats">
                      <span className="stat-item">
                        <FaUsers /> {activity.so_dang_ky || 0} đăng ký
                      </span>
                      <span className="stat-item success">
                        <FaCheckCircle /> {activity.so_hoan_thanh || 0} hoàn thành
                      </span>
                    </div>
                  </div>
                  <div className="activity-item-actions">
                    <button 
                      className="btn-delete-activity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteActivity(activity);
                      }}
                      title="Xóa hoạt động"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chi tiết và danh sách đăng ký */}
        <div className="registrations-panel glass-card">
          {!selectedActivity ? (
            <div className="empty-state">
              <FaListAlt size={60} />
              <h3>Chọn một hoạt động</h3>
              <p>Chọn hoạt động từ danh sách bên trái để xem chi tiết và quản lý đăng ký</p>
            </div>
          ) : (
            <>
              <div className="panel-header">
                <div className="header-info">
                  <h2>{selectedActivity.ten_hoat_dong}</h2>
                  <div className="activity-meta">
                    <span><FaUniversity /> {selectedActivity.don_vi_phu_trach}</span>
                    <span><FaCalendarAlt /> {formatDate(selectedActivity.thoi_gian_bat_dau)}</span>
                    <span><FaMapMarkerAlt /> {selectedActivity.dia_diem}</span>
                  </div>
                </div>
              </div>

              <div className="registrations-toolbar">
                <div className="filter-tabs">
                  <button 
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    Tất cả ({registrations.length})
                  </button>
                  <button 
                    className={`filter-tab ${filter === 'dang_tham_gia' ? 'active' : ''}`}
                    onClick={() => setFilter('dang_tham_gia')}
                  >
                    Đang tham gia ({registrations.filter(r => r.trang_thai === 'dang_tham_gia').length})
                  </button>
                  <button 
                    className={`filter-tab ${filter === 'hoan_thanh' ? 'active' : ''}`}
                    onClick={() => setFilter('hoan_thanh')}
                  >
                    Hoàn thành ({registrations.filter(r => r.trang_thai === 'hoan_thanh').length})
                  </button>
                </div>
                
                <div className="toolbar-actions">
                  {registrations.filter(r => r.trang_thai === 'hoan_thanh').length > 0 && (
                    <button className="btn btn-export-excel" onClick={handleExportExcel}>
                      <FaFileExcel /> Xuất Excel
                    </button>
                  )}
                  
                  {selectedIds.length > 0 && (
                    <button className="btn btn-confirm-bulk" onClick={handleConfirmBulk}>
                      <FaUserCheck /> Xác nhận {selectedIds.length} sinh viên
                    </button>
                  )}
                </div>
              </div>

              {getFilteredRegistrations().length === 0 ? (
                <div className="empty-state-small">
                  <p>Không có sinh viên nào</p>
                </div>
              ) : (
                <div className="registrations-table-wrapper">
                  <table className="registrations-table">
                    <thead>
                      <tr>
                        <th>
                          <input 
                            type="checkbox" 
                            onChange={handleSelectAll}
                            checked={selectedIds.length > 0 && selectedIds.length === getFilteredRegistrations().filter(r => r.trang_thai === 'dang_tham_gia').length}
                          />
                        </th>
                        <th>STT</th>
                        <th>MSSV</th>
                        <th>Họ tên</th>
                        <th>Lớp</th>
                        <th>Khoa</th>
                        <th>Ngày đăng ký</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredRegistrations().map((reg, index) => (
                        <tr key={reg.id}>
                          <td>
                            {reg.trang_thai === 'dang_tham_gia' && (
                              <input 
                                type="checkbox"
                                checked={selectedIds.includes(reg.id)}
                                onChange={() => handleSelectOne(reg.id)}
                              />
                            )}
                          </td>
                          <td>{index + 1}</td>
                          <td><strong>{reg.ma_sinh_vien}</strong></td>
                          <td>{reg.ho_ten}</td>
                          <td>{reg.lop}</td>
                          <td>{reg.khoa}</td>
                          <td>{formatDateTime(reg.ngay_dang_ky)}</td>
                          <td>{getStatusBadge(reg.trang_thai)}</td>
                          <td>
                            {reg.trang_thai === 'dang_tham_gia' && (
                              <button 
                                className="btn-action btn-confirm"
                                onClick={() => handleConfirmOne(reg.id)}
                                title="Xác nhận hoàn thành"
                              >
                                <FaCheckCircle />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuanLyHoatDong;
