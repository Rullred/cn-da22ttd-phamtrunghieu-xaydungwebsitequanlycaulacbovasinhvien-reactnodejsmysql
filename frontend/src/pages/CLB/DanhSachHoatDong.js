import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FaFileExcel, FaFilePdf, FaPaperPlane, FaDownload, 
  FaEye, FaClock, FaCheckCircle, FaSpinner, FaPlus,
  FaCalendarAlt, FaClipboardList, FaTimes
} from 'react-icons/fa';
import './DanhSachHoatDong.css';

const MUC_DICH_OPTIONS = [
  { value: 've_nguon', label: 'Về nguồn' },
  { value: 'van_nghe', label: 'Văn nghệ' },
  { value: 've_sinh', label: 'Vệ sinh' },
  { value: 'ho_tro', label: 'Hỗ trợ' },
  { value: 'cuoc_thi', label: 'Cuộc thi' },
  { value: 'toa_dam', label: 'Tọa đàm' },
  { value: 'the_thao', label: 'Thể thao' },
  { value: 'tinh_nguyen', label: 'Tình nguyện' },
  { value: 'hoi_thao', label: 'Hội thảo' },
  { value: 'khac', label: 'Khác' }
];

const DanhSachHoatDong = () => {
  const [activeTab, setActiveTab] = useState('yeu-cau');
  const [requests, setRequests] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form gửi yêu cầu
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ten_hoat_dong: '',
    ngay_to_chuc: '',
    mo_ta: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, filesRes] = await Promise.all([
        api.get('/danhsach/clb/yeu-cau'),
        api.get('/danhsach/clb/danh-sach-file')
      ]);
      setRequests(reqRes.data);
      setFiles(filesRes.data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append('ten_hoat_dong', formData.ten_hoat_dong);
    data.append('ngay_to_chuc', formData.ngay_to_chuc);
    data.append('mo_ta', formData.mo_ta);
    if (selectedFile) {
      data.append('file_excel', selectedFile);
    }

    try {
      await api.post('/danhsach/clb/gui-yeu-cau', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Gửi yêu cầu thành công! Admin sẽ xử lý và gửi lại danh sách.');
      setShowForm(false);
      setFormData({ ten_hoat_dong: '', ngay_to_chuc: '', mo_ta: '' });
      setSelectedFile(null);
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'cho_xu_ly':
        return <span className="badge badge-warning"><FaClock /> Chờ xử lý</span>;
      case 'dang_xu_ly':
        return <span className="badge badge-info"><FaSpinner /> Đang xử lý</span>;
      case 'hoan_thanh':
        return <span className="badge badge-success"><FaCheckCircle /> Hoàn thành</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getMucDichLabel = (value) => {
    const found = MUC_DICH_OPTIONS.find(opt => opt.value === value);
    return found ? found.label : value;
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="danh-sach-hoat-dong-page">
      <div className="page-header">
        <h1><FaClipboardList /> Danh sách Hoạt động</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <FaPlus /> Gửi yêu cầu mới
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'yeu-cau' ? 'active' : ''}`}
          onClick={() => setActiveTab('yeu-cau')}
        >
          Yêu cầu đã gửi ({requests.length})
        </button>
        <button 
          className={`tab ${activeTab === 'danh-sach' ? 'active' : ''}`}
          onClick={() => setActiveTab('danh-sach')}
        >
          Danh sách từ Admin ({files.length})
        </button>
      </div>

      {activeTab === 'yeu-cau' && (
        <div className="requests-section">
          {requests.length === 0 ? (
            <div className="empty-state">
              <FaClipboardList size={48} />
              <p>Chưa có yêu cầu nào</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <FaPlus /> Gửi yêu cầu đầu tiên
              </button>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map(req => (
                <div key={req.id} className={`request-card ${req.trang_thai}`}>
                  <div className="request-header">
                    <h3>{req.ten_hoat_dong}</h3>
                    {getStatusBadge(req.trang_thai)}
                  </div>
                  <div className="request-info">
                    <p><FaCalendarAlt /> <strong>Ngày tổ chức:</strong> {new Date(req.ngay_to_chuc).toLocaleDateString('vi-VN')}</p>
                    {req.mo_ta && <p><strong>Mô tả:</strong> {req.mo_ta}</p>}
                    <p><FaClock /> <strong>Gửi lúc:</strong> {new Date(req.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                  {req.file_excel && (
                    <div className="request-file">
                      <FaFileExcel /> File Excel đã đính kèm
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'danh-sach' && (
        <div className="files-section">
          {files.length === 0 ? (
            <div className="empty-state">
              <FaFilePdf size={48} />
              <p>Chưa có danh sách nào từ Admin</p>
            </div>
          ) : (
            <div className="files-grid">
              {files.map(file => (
                <div key={file.id} className="file-card">
                  <div className="file-icon">
                    <FaFilePdf size={40} />
                  </div>
                  <div className="file-info">
                    <h4>{file.ten_hoat_dong}</h4>
                    <p className="file-meta">
                      {file.muc_dich && <span className="tag">{getMucDichLabel(file.muc_dich)}</span>}
                    </p>
                    {file.mo_ta && <p className="file-desc">{file.mo_ta}</p>}
                    <p className="file-date">
                      <FaClock /> {new Date(file.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="file-actions">
                    <a 
                      href={`http://localhost:5000${file.file_pdf}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-info btn-sm"
                    >
                      <FaEye /> Xem
                    </a>
                    <a 
                      href={`http://localhost:5000${file.file_pdf}`} 
                      download 
                      className="btn btn-success btn-sm"
                    >
                      <FaDownload /> Tải về
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Gửi yêu cầu */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaPaperPlane /> Gửi yêu cầu làm danh sách</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên hoạt động *</label>
                <input
                  type="text"
                  value={formData.ten_hoat_dong}
                  onChange={e => setFormData({...formData, ten_hoat_dong: e.target.value})}
                  required
                  placeholder="VD: Hoạt động về nguồn tại Bến Tre"
                />
              </div>
              <div className="form-group">
                <label>Ngày tổ chức *</label>
                <input
                  type="date"
                  value={formData.ngay_to_chuc}
                  onChange={e => setFormData({...formData, ngay_to_chuc: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả / Ghi chú</label>
                <textarea
                  value={formData.mo_ta}
                  onChange={e => setFormData({...formData, mo_ta: e.target.value})}
                  placeholder="Thông tin thêm về hoạt động, yêu cầu đặc biệt..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>File Excel danh sách (nếu có)</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={e => setSelectedFile(e.target.files[0])}
                  />
                  {selectedFile && (
                    <p className="file-name"><FaFileExcel /> {selectedFile.name}</p>
                  )}
                </div>
                <small className="form-hint">Chấp nhận file .xlsx, .xls, .csv</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : <><FaPaperPlane /> Gửi yêu cầu</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanhSachHoatDong;
