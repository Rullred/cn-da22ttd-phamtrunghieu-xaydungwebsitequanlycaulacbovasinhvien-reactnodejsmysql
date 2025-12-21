import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FaFilePdf, FaDownload, FaEye, FaClock, FaFilter,
  FaUniversity, FaClipboardList, FaSearch
} from 'react-icons/fa';
import './DanhSachHoatDongFile.css';

const MUC_DICH_OPTIONS = [
  { value: '', label: 'Tất cả' },
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

const DanhSachHoatDongFile = () => {
  const [files, setFiles] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    muc_dich: '',
    cau_lac_bo_id: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [filters]);

  const fetchClubs = async () => {
    try {
      const response = await api.get('/danhsach/sinhvien/clubs');
      setClubs(response.data);
    } catch (error) {
      console.error('Lỗi tải danh sách CLB:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.muc_dich) params.append('muc_dich', filters.muc_dich);
      if (filters.cau_lac_bo_id) params.append('cau_lac_bo_id', filters.cau_lac_bo_id);
      
      const response = await api.get(`/danhsach/sinhvien/danh-sach-file?${params.toString()}`);
      setFiles(response.data);
    } catch (error) {
      console.error('Lỗi tải danh sách file:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMucDichLabel = (value) => {
    const found = MUC_DICH_OPTIONS.find(opt => opt.value === value);
    return found ? found.label : value;
  };

  const filteredFiles = files.filter(file => 
    file.ten_hoat_dong.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.mo_ta && file.mo_ta.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="danh-sach-file-page">
      <div className="page-header">
        <h1><FaClipboardList /> Danh sách Hoạt động</h1>
        <p className="page-desc">Xem và tải danh sách các hoạt động đã được phê duyệt</p>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoạt động..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label><FaFilter /> Mục đích:</label>
          <select
            value={filters.muc_dich}
            onChange={e => setFilters({...filters, muc_dich: e.target.value})}
          >
            {MUC_DICH_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label><FaUniversity /> CLB:</label>
          <select
            value={filters.cau_lac_bo_id}
            onChange={e => setFilters({...filters, cau_lac_bo_id: e.target.value})}
          >
            <option value="">Tất cả CLB</option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>{club.ten_clb}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="empty-state">
          <FaFilePdf size={60} />
          <h3>Chưa có danh sách nào</h3>
          <p>Các danh sách hoạt động sẽ được hiển thị tại đây sau khi Admin upload</p>
        </div>
      ) : (
        <div className="files-grid">
          {filteredFiles.map(file => (
            <div key={file.id} className="file-card">
              <div className="file-card-header">
                <div className="file-icon">
                  <FaFilePdf size={32} />
                </div>
                <div className="file-tags">
                  {file.muc_dich && (
                    <span className="tag muc-dich">{getMucDichLabel(file.muc_dich)}</span>
                  )}
                  {file.ten_clb && (
                    <span className="tag clb">{file.ten_clb}</span>
                  )}
                </div>
              </div>
              <div className="file-card-body">
                <h3>{file.ten_hoat_dong}</h3>
                {file.mo_ta && <p className="file-desc">{file.mo_ta}</p>}
                <p className="file-date">
                  <FaClock /> {new Date(file.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="file-card-actions">
                <a 
                  href={`http://localhost:5000${file.file_pdf}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-view"
                >
                  <FaEye /> Xem
                </a>
                <a 
                  href={`http://localhost:5000${file.file_pdf}`} 
                  download 
                  className="btn btn-download"
                >
                  <FaDownload /> Tải về
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DanhSachHoatDongFile;
