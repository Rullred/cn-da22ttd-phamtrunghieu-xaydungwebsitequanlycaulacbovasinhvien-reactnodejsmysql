import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FaFileExcel, FaFilePdf, FaUpload, FaDownload, FaTrash, 
  FaEye, FaClock, FaCheckCircle, FaSpinner, FaFilter,
  FaUniversity, FaCalendarAlt, FaClipboardList
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
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form upload
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    ten_hoat_dong: '',
    muc_dich: '',
    cau_lac_bo_id: '',
    mo_ta: '',
    yeu_cau_id: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, filesRes, clubsRes] = await Promise.all([
        api.get('/danhsach/admin/yeu-cau'),
        api.get('/danhsach/admin/danh-sach-file'),
        api.get('/danhsach/admin/clubs')
      ]);
      setRequests(reqRes.data);
      setFiles(filesRes.data);
      setClubs(clubsRes.data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/danhsach/admin/yeu-cau/${id}/trang-thai`, { trang_thai: newStatus });
      fetchData();
    } catch (error) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Vui lòng chọn file PDF');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file_pdf', selectedFile);
    formData.append('ten_hoat_dong', uploadData.ten_hoat_dong);
    formData.append('muc_dich', uploadData.muc_dich);
    formData.append('cau_lac_bo_id', uploadData.cau_lac_bo_id);
    formData.append('mo_ta', uploadData.mo_ta);
    if (uploadData.yeu_cau_id) {
      formData.append('yeu_cau_id', uploadData.yeu_cau_id);
    }

    try {
      await api.post('/danhsach/admin/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Upload thành công!');
      setShowUploadForm(false);
      setUploadData({ ten_hoat_dong: '', muc_dich: '', cau_lac_bo_id: '', mo_ta: '', yeu_cau_id: '' });
      setSelectedFile(null);
      fetchData();
    } catch (error) {
      alert('Lỗi upload: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa file này?')) return;
    try {
      await api.delete(`/danhsach/admin/file/${id}`);
      fetchData();
    } catch (error) {
      alert('Lỗi xóa file');
    }
  };

  const openUploadFromRequest = (request) => {
    setUploadData({
      ten_hoat_dong: request.ten_hoat_dong,
      muc_dich: '',
      cau_lac_bo_id: request.cau_lac_bo_id,
      mo_ta: '',
      yeu_cau_id: request.id
    });
    setShowUploadForm(true);
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
        <h1><FaClipboardList /> Quản lý Danh sách Hoạt động</h1>
        <button className="btn btn-primary" onClick={() => setShowUploadForm(true)}>
          <FaUpload /> Upload PDF mới
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'yeu-cau' ? 'active' : ''}`}
          onClick={() => setActiveTab('yeu-cau')}
        >
          Yêu cầu từ CLB ({requests.filter(r => r.trang_thai !== 'hoan_thanh').length})
        </button>
        <button 
          className={`tab ${activeTab === 'danh-sach' ? 'active' : ''}`}
          onClick={() => setActiveTab('danh-sach')}
        >
          Danh sách đã upload ({files.length})
        </button>
      </div>

      {activeTab === 'yeu-cau' && (
        <div className="requests-section">
          {requests.length === 0 ? (
            <div className="empty-state">
              <FaClipboardList size={48} />
              <p>Chưa có yêu cầu nào từ CLB</p>
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
                    <p><FaUniversity /> <strong>CLB:</strong> {req.ten_clb}</p>
                    <p><FaCalendarAlt /> <strong>Ngày tổ chức:</strong> {new Date(req.ngay_to_chuc).toLocaleDateString('vi-VN')}</p>
                    {req.mo_ta && <p><strong>Mô tả:</strong> {req.mo_ta}</p>}
                    <p><FaClock /> <strong>Gửi lúc:</strong> {new Date(req.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="request-actions">
                    {req.file_excel && (
                      <a 
                        href={`http://localhost:5000${req.file_excel}`} 
                        download 
                        className="btn btn-success btn-sm"
                      >
                        <FaFileExcel /> Tải Excel
                      </a>
                    )}
                    {req.trang_thai === 'cho_xu_ly' && (
                      <button 
                        className="btn btn-info btn-sm"
                        onClick={() => handleStatusChange(req.id, 'dang_xu_ly')}
                      >
                        Đang xử lý
                      </button>
                    )}
                    {req.trang_thai !== 'hoan_thanh' && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => openUploadFromRequest(req)}
                      >
                        <FaUpload /> Upload PDF
                      </button>
                    )}
                  </div>
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
              <p>Chưa có file nào được upload</p>
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
                      {file.ten_clb && <span className="tag clb">{file.ten_clb}</span>}
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
                      <FaDownload /> Tải
                    </a>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(file.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Upload */}
      {showUploadForm && (
        <div className="modal-overlay" onClick={() => setShowUploadForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2><FaUpload /> Upload Danh sách PDF</h2>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Tên hoạt động *</label>
                <input
                  type="text"
                  value={uploadData.ten_hoat_dong}
                  onChange={e => setUploadData({...uploadData, ten_hoat_dong: e.target.value})}
                  required
                  placeholder="Nhập tên hoạt động"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mục đích</label>
                  <select
                    value={uploadData.muc_dich}
                    onChange={e => setUploadData({...uploadData, muc_dich: e.target.value})}
                  >
                    <option value="">-- Chọn mục đích --</option>
                    {MUC_DICH_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Câu lạc bộ</label>
                  <select
                    value={uploadData.cau_lac_bo_id}
                    onChange={e => setUploadData({...uploadData, cau_lac_bo_id: e.target.value})}
                  >
                    <option value="">-- Tất cả / Chung --</option>
                    {clubs.map(club => (
                      <option key={club.id} value={club.id}>{club.ten_clb}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={uploadData.mo_ta}
                  onChange={e => setUploadData({...uploadData, mo_ta: e.target.value})}
                  placeholder="Mô tả ngắn về danh sách"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>File PDF *</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setSelectedFile(e.target.files[0])}
                    required
                  />
                  {selectedFile && (
                    <p className="file-name"><FaFilePdf /> {selectedFile.name}</p>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Đang upload...' : 'Upload'}
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
