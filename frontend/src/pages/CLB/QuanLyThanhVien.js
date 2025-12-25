import React, { useState, useEffect } from 'react';
import { clbService } from '../../services/api';
import Loading from '../../components/Loading';
import { FaUser, FaSearch, FaUserPlus, FaTimes, FaFileExport } from 'react-icons/fa';
import api from '../../services/api';

// Hàm xử lý URL avatar
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  return `http://localhost:5000${avatarPath}`;
};

const QuanLyThanhVien = () => {
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  
  // State cho bulk select
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [selectAllRequests, setSelectAllRequests] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectAllMembers, setSelectAllMembers] = useState(false);
  
  // State cho tìm kiếm sinh viên
  const [searchMSSV, setSearchMSSV] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, requestsRes] = await Promise.all([
        clbService.getMembers(),
        clbService.getMemberRequests()
      ]);
      setMembers(membersRes.data);
      setRequests(requestsRes.data);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers cho bulk select
  const handleSelectAllRequests = (e) => {
    const checked = e.target.checked;
    setSelectAllRequests(checked);
    if (checked) {
      setSelectedRequests(requests.map(r => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (id) => {
    setSelectedRequests(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handlers cho chọn tất cả thành viên
  const handleSelectAllMembers = (e) => {
    const checked = e.target.checked;
    setSelectAllMembers(checked);
    if (checked) {
      setSelectedMembers(members.map(m => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectMember = (id) => {
    setSelectedMembers(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Xuất danh sách thành viên ra Excel
  const handleExportMembers = () => {
    if (members.length === 0) {
      alert('Chưa có thành viên nào để xuất');
      return;
    }

    // Lọc thành viên đã chọn hoặc tất cả nếu không chọn
    const membersToExport = selectedMembers.length > 0 
      ? members.filter(m => selectedMembers.includes(m.id))
      : members;

    if (membersToExport.length === 0) {
      alert('Vui lòng chọn ít nhất một thành viên để xuất');
      return;
    }

    // Tạo CSV content
    const headers = ['STT', 'Họ tên', 'MSSV', 'Lớp', 'Khoa', 'Khóa học', 'Vai trò', 'Ngày tham gia'];
    const rows = membersToExport.map((member, index) => [
      index + 1,
      member.ho_ten,
      member.ma_sinh_vien,
      member.lop || '',
      member.khoa || '',
      member.khoa_hoc ? `Khóa ${member.khoa_hoc}` : '',
      member.vai_tro === 'thanh_vien' ? 'Thành viên' : member.vai_tro,
      new Date(member.ngay_duyet).toLocaleDateString('vi-VN')
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
    link.setAttribute('download', `Danh_sach_thanh_vien_CLB_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Đã xuất ${membersToExport.length} thành viên!`);
  };

  // Bulk approve members
  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      alert('Vui lòng chọn ít nhất một yêu cầu');
      return;
    }

    if (!window.confirm(`Phê duyệt ${selectedRequests.length} yêu cầu đã chọn?`)) {
      return;
    }

    try {
      await clbService.approveMembersBulk(selectedRequests);
      alert(`Đã phê duyệt thành công ${selectedRequests.length} thành viên!`);
      setSelectedRequests([]);
      setSelectAllRequests(false);
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể phê duyệt hàng loạt'));
    }
  };

  const handleApprove = async (id) => {
    try {
      await clbService.approveMember(id);
      alert('Phê duyệt thành viên thành công!');
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể phê duyệt'));
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Bạn có chắc muốn từ chối yêu cầu này?')) return;

    try {
      await clbService.rejectMember(id);
      alert('Đã từ chối yêu cầu');
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể từ chối'));
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Bạn có chắc muốn loại bỏ thành viên này?')) return;

    try {
      await clbService.removeMember(id);
      alert('Loại bỏ thành viên thành công');
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể loại bỏ'));
    }
  };

  // Tìm kiếm sinh viên bằng MSSV
  const handleSearch = async () => {
    if (!searchMSSV.trim()) {
      setSearchError('Vui lòng nhập MSSV');
      return;
    }

    setSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const response = await api.get(`/caulacbo/search-student/${searchMSSV.trim()}`);
      setSearchResult(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setSearchError('Không tìm thấy sinh viên với MSSV này');
      } else {
        setSearchError(error.response?.data?.message || 'Lỗi tìm kiếm');
      }
    } finally {
      setSearching(false);
    }
  };

  // Thêm sinh viên vào CLB
  const handleAddMember = async (sinhVienId) => {
    try {
      await api.post(`/caulacbo/add-member/${sinhVienId}`);
      alert('Thêm thành viên thành công!');
      setSearchResult(null);
      setSearchMSSV('');
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể thêm thành viên'));
    }
  };

  // Xóa kết quả tìm kiếm
  const clearSearch = () => {
    setSearchMSSV('');
    setSearchResult(null);
    setSearchError('');
  };

  if (loading) return <Loading />;

  return (
    <div className="quan-ly-thanh-vien">
      <h1>Quản lý Thành viên</h1>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Thành viên ({members.length})
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Yêu cầu chờ duyệt ({requests.length})
        </button>
        <button 
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <FaSearch style={{ marginRight: '5px' }} />
          Tìm & Thêm SV
        </button>
      </div>

      {activeTab === 'search' && (
        <div className="search-section">
          <div className="search-card">
            <h3><FaSearch /> Tìm kiếm sinh viên bằng MSSV</h3>
            <p className="search-desc">Nhập MSSV để tìm và thêm sinh viên vào câu lạc bộ</p>
            
            <div className="search-box">
              <input
                type="text"
                placeholder="Nhập MSSV (VD: 110122076)"
                value={searchMSSV}
                onChange={(e) => setSearchMSSV(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              {searchMSSV && (
                <button className="clear-btn" onClick={clearSearch}>
                  <FaTimes />
                </button>
              )}
              <button className="search-btn" onClick={handleSearch} disabled={searching}>
                {searching ? 'Đang tìm...' : <><FaSearch /> Tìm kiếm</>}
              </button>
            </div>

            {searchError && (
              <div className="search-error">
                {searchError}
              </div>
            )}

            {searchResult && (
              <div className="search-result">
                <div className="result-card">
                  <div className="result-avatar">
                    {searchResult.anh_dai_dien ? (
                      <img 
                        src={getAvatarUrl(searchResult.anh_dai_dien)} 
                        alt={searchResult.ho_ten}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className="avatar-fallback" style={{ display: searchResult.anh_dai_dien ? 'none' : 'flex' }}>
                      <FaUser size={30} />
                    </span>
                  </div>
                  <div className="result-info">
                    <h4>{searchResult.ho_ten}</h4>
                    <p><strong>MSSV:</strong> {searchResult.ma_sinh_vien}</p>
                    <p><strong>Lớp:</strong> {searchResult.lop || 'Chưa cập nhật'}</p>
                    <p><strong>Khoa:</strong> {searchResult.khoa || 'Chưa cập nhật'}</p>
                    {searchResult.is_member && (
                      <span className="already-member">Đã là thành viên CLB</span>
                    )}
                  </div>
                  <div className="result-action">
                    {searchResult.is_member ? (
                      <button className="btn btn-secondary" disabled>
                        Đã là thành viên
                      </button>
                    ) : (
                      <button 
                        className="btn btn-success"
                        onClick={() => handleAddMember(searchResult.id)}
                      >
                        <FaUserPlus /> Thêm vào CLB
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="requests-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h3>Yêu cầu chờ duyệt ({requests.length})</h3>
              {requests.length > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={selectAllRequests}
                    onChange={handleSelectAllRequests}
                  />
                  <span style={{ fontWeight: '500' }}>Chọn tất cả</span>
                </label>
              )}
            </div>
            {selectedRequests.length > 0 && (
              <button onClick={handleBulkApprove} className="btn btn-success">
                <FaUserPlus /> Phê duyệt {selectedRequests.length} yêu cầu
              </button>
            )}
          </div>
          {requests.length === 0 ? (
            <div className="card text-center">
              <p>Không có yêu cầu nào</p>
            </div>
          ) : (
            <div className="members-grid">
              {requests.map(request => (
                <div key={request.id} className="member-card card">
                  <div className="card-checkbox">
                    <input 
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => handleSelectRequest(request.id)}
                    />
                  </div>
                  <div className="member-avatar">
                    {request.anh_dai_dien ? (
                      <img 
                        src={getAvatarUrl(request.anh_dai_dien)} 
                        alt={request.ho_ten}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className="avatar-fallback" style={{ display: request.anh_dai_dien ? 'none' : 'flex' }}>
                      <FaUser size={40} />
                    </span>
                  </div>
                  <h3>{request.ho_ten}</h3>
                  <p><strong>MSSV:</strong> {request.ma_sinh_vien}</p>
                  <p><strong>Lớp:</strong> {request.lop}</p>
                  <p><strong>Khoa:</strong> {request.khoa}</p>
                  <div className="member-actions">
                    <button onClick={() => handleApprove(request.id)} className="btn btn-success btn-sm">
                      Phê duyệt
                    </button>
                    <button onClick={() => handleReject(request.id)} className="btn btn-danger btn-sm">
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="members-section">
          {members.length === 0 ? (
            <div className="card text-center">
              <p>Chưa có thành viên nào</p>
            </div>
          ) : (
            <>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Danh sách thành viên ({members.length})</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedMembers.length > 0 && (
                    <span style={{ padding: '8px 15px', background: '#e8f4fd', borderRadius: '5px', color: '#3498db', fontWeight: '500' }}>
                      Đã chọn: {selectedMembers.length}
                    </span>
                  )}
                  <button 
                    className="btn btn-success"
                    onClick={handleExportMembers}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <FaFileExport /> Xuất Excel {selectedMembers.length > 0 && `(${selectedMembers.length})`}
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>
                        <input 
                          type="checkbox"
                          checked={selectAllMembers}
                          onChange={handleSelectAllMembers}
                          disabled={members.length === 0}
                        />
                      </th>
                      <th>Ảnh</th>
                      <th>Họ tên</th>
                      <th>MSSV</th>
                      <th>Lớp</th>
                      <th>Khoa</th>
                      <th>Vai trò</th>
                      <th>Ngày tham gia</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(member => (
                      <tr key={member.id}>
                        <td>
                          <input 
                            type="checkbox"
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => handleSelectMember(member.id)}
                          />
                        </td>
                        <td>
                          <div className="table-avatar">
                          {member.anh_dai_dien ? (
                            <img 
                              src={getAvatarUrl(member.anh_dai_dien)} 
                              alt={member.ho_ten}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span className="avatar-fallback" style={{ display: member.anh_dai_dien ? 'none' : 'flex' }}>
                            <FaUser />
                          </span>
                        </div>
                      </td>
                      <td>{member.ho_ten}</td>
                      <td>{member.ma_sinh_vien}</td>
                      <td>{member.lop}</td>
                      <td>{member.khoa}</td>
                      <td>
                        <span className="badge badge-info">{member.vai_tro}</span>
                      </td>
                      <td>{new Date(member.ngay_duyet).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button onClick={() => handleRemove(member.id)} className="btn btn-danger btn-sm">
                          Loại bỏ
                        </button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .tab {
          padding: 12px 24px;
          background: white;
          border: 2px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .tab.active {
          background: #1976d2;
          color: white;
          border-color: #1976d2;
        }

        .tab:hover:not(.active) {
          border-color: #1976d2;
          color: #1976d2;
        }

        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .member-card {
          text-align: center;
          padding: 20px;
        }

        .member-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin-bottom: 15px;
          border: 3px solid #1976d2;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin-left: auto;
          margin-right: auto;
        }

        .member-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .member-avatar .avatar-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .table-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .table-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .table-avatar .avatar-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }

        .member-card h3 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .member-card p {
          color: #666;
          font-size: 14px;
          margin: 5px 0;
        }

        .member-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 15px;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        /* Search Section */
        .search-section {
          margin-top: 20px;
        }

        .search-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }

        .search-card h3 {
          color: #2c3e50;
          margin: 0 0 10px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .search-desc {
          color: #7f8c8d;
          margin: 0 0 20px 0;
        }

        .search-box {
          display: flex;
          gap: 10px;
          align-items: center;
          max-width: 600px;
        }

        .search-box input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.3s;
        }

        .search-box input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .search-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .search-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .clear-btn {
          padding: 8px;
          background: #e0e0e0;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .clear-btn:hover {
          background: #ff6b6b;
          color: white;
        }

        .search-error {
          margin-top: 15px;
          padding: 12px 16px;
          background: #fff5f5;
          border: 1px solid #feb2b2;
          border-radius: 8px;
          color: #c53030;
          font-size: 14px;
        }

        .search-result {
          margin-top: 20px;
        }

        .result-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .result-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          flex-shrink: 0;
        }

        .result-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .result-avatar .avatar-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .result-info {
          flex: 1;
        }

        .result-info h4 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 18px;
        }

        .result-info p {
          margin: 5px 0;
          color: #5a6c7d;
          font-size: 14px;
        }

        .already-member {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 12px;
          background: #48bb78;
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .result-action {
          flex-shrink: 0;
        }

        .result-action .btn {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .result-action .btn-success {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
        }

        .result-action .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
        }

        .result-action .btn-secondary {
          background: #a0aec0;
          color: white;
        }

        @media (max-width: 768px) {
          .search-box {
            flex-direction: column;
          }

          .search-box input,
          .search-btn {
            width: 100%;
          }

          .result-card {
            flex-direction: column;
            text-align: center;
          }

          .result-info {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default QuanLyThanhVien;
