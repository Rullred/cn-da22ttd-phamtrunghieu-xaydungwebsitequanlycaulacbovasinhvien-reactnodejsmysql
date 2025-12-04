import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { 
  FaUserGraduate, 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaCalendarAlt,
  FaUserCheck,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import Loading from '../../components/Loading';
import './QuanLySinhVien.css';

const QuanLySinhVien = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    mat_khau: '',
    ho_ten: '',
    ma_sinh_vien: '',
    lop: '',
    khoa: '',
    nam_sinh: '',
    so_dien_thoai: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (search = '') => {
    try {
      setLoading(true);
      const response = await adminService.getStudents(search);
      setStudents(response.data);
    } catch (error) {
      console.error('Lỗi lấy danh sách sinh viên:', error);
      alert('Lỗi lấy danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(searchTerm);
  };

  const handleCreate = () => {
    setEditingStudent(null);
    setFormData({
      email: '',
      mat_khau: '',
      ho_ten: '',
      ma_sinh_vien: '',
      lop: '',
      khoa: '',
      nam_sinh: '',
      so_dien_thoai: ''
    });
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      email: student.email,
      mat_khau: '', // Không hiển thị mật khẩu cũ
      ho_ten: student.ho_ten,
      ma_sinh_vien: student.ma_sinh_vien,
      lop: student.lop,
      khoa: student.khoa,
      nam_sinh: student.nam_sinh,
      so_dien_thoai: student.so_dien_thoai || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id, ho_ten) => {
    if (deleting) return; // Ngăn xóa nhiều lần
    
    if (!window.confirm(`Bạn có chắc muốn xóa sinh viên "${ho_ten}"?\n\nLưu ý: Tất cả đăng ký hoạt động và thành viên CLB của sinh viên này cũng sẽ bị xóa.`)) {
      return;
    }

    try {
      setDeleting(id);
      await adminService.deleteStudent(id);
      alert('Xóa sinh viên thành công!');
      fetchStudents(searchTerm);
    } catch (error) {
      console.error('Lỗi xóa sinh viên:', error);
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xóa sinh viên'));
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return; // Ngăn submit nhiều lần

    // Validate
    if (!formData.ho_ten || !formData.ma_sinh_vien || !formData.email) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (!editingStudent && !formData.mat_khau) {
      alert('Vui lòng nhập mật khẩu!');
      return;
    }

    try {
      setSubmitting(true);
      if (editingStudent) {
        // Cập nhật
        await adminService.updateStudent(editingStudent.id, formData);
        alert('Cập nhật sinh viên thành công!');
      } else {
        // Tạo mới
        await adminService.createStudent(formData);
        alert('Tạo sinh viên thành công!');
      }
      
      setShowModal(false);
      fetchStudents(searchTerm);
    } catch (error) {
      console.error('Lỗi lưu sinh viên:', error);
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể lưu sinh viên'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) return <Loading />;

  return (
    <div className="quan-ly-sinh-vien">
      <div className="page-header">
        <div>
          <h1><FaUserGraduate /> Quản lý Sinh viên</h1>
          <p className="subtitle">Quản lý thông tin sinh viên trong hệ thống</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <FaUserCheck />
            <span>{students.length} sinh viên</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <form onSubmit={handleSearch} className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo MSSV, tên, lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-search">Tìm kiếm</button>
        </form>

        <button className="btn-add" onClick={handleCreate}>
          <FaPlus /> Thêm sinh viên
        </button>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <FaUserGraduate size={60} />
          <h3>Không tìm thấy sinh viên</h3>
          <p>Hãy thêm sinh viên mới hoặc thử tìm kiếm khác</p>
        </div>
      ) : (
        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Lớp</th>
                <th>Khoa</th>
                <th>Năm sinh</th>
                <th>SĐT</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td className="mssv-cell">
                    <FaIdCard className="cell-icon" />
                    <strong>{student.ma_sinh_vien}</strong>
                  </td>
                  <td className="name-cell">
                    <div className="student-avatar">
                      <img 
                        src={student.anh_dai_dien || '/avtar.png'} 
                        alt={student.ho_ten}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/avtar.png';
                        }}
                      />
                    </div>
                    <span>{student.ho_ten}</span>
                  </td>
                  <td>
                    <FaEnvelope className="cell-icon" />
                    {student.email}
                  </td>
                  <td>{student.lop}</td>
                  <td>{student.khoa}</td>
                  <td>{student.nam_sinh}</td>
                  <td>
                    {student.so_dien_thoai && (
                      <>
                        <FaPhone className="cell-icon" />
                        {student.so_dien_thoai}
                      </>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${student.trang_thai}`}>
                      {student.trang_thai === 'da_duyet' ? 'Đã duyệt' : 
                       student.trang_thai === 'cho_duyet' ? 'Chờ duyệt' : 'Từ chối'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(student)}
                      title="Sửa"
                      disabled={deleting === student.id}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(student.id, student.ho_ten)}
                      title="Xóa"
                      disabled={deleting === student.id}
                    >
                      {deleting === student.id ? '...' : <FaTrash />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingStudent ? (
                  <><FaEdit /> Chỉnh sửa sinh viên</>
                ) : (
                  <><FaPlus /> Thêm sinh viên mới</>
                )}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaIdCard /> MSSV <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="ma_sinh_vien"
                    value={formData.ma_sinh_vien}
                    onChange={handleChange}
                    placeholder="VD: 110122076"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaUserGraduate /> Họ tên <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="ho_ten"
                    value={formData.ho_ten}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaEnvelope /> Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@st.tvu.edu.vn"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaPhone /> Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="so_dien_thoai"
                    value={formData.so_dien_thoai}
                    onChange={handleChange}
                    placeholder="0123456789"
                  />
                </div>
              </div>

              {!editingStudent && (
                <div className="form-group">
                  <label>
                    Mật khẩu <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    name="mat_khau"
                    value={formData.mat_khau}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    required={!editingStudent}
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaUniversity /> Lớp
                  </label>
                  <input
                    type="text"
                    name="lop"
                    value={formData.lop}
                    onChange={handleChange}
                    placeholder="VD: 11DHTH01"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaUniversity /> Khoa
                  </label>
                  <input
                    type="text"
                    name="khoa"
                    value={formData.khoa}
                    onChange={handleChange}
                    placeholder="VD: Công nghệ thông tin"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FaCalendarAlt /> Năm sinh
                </label>
                <input
                  type="number"
                  name="nam_sinh"
                  value={formData.nam_sinh}
                  onChange={handleChange}
                  placeholder="VD: 2003"
                  min="1980"
                  max="2010"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} disabled={submitting}>
                  <FaTimes /> Hủy
                </button>
                <button type="submit" className="btn-save" disabled={submitting}>
                  <FaSave /> {submitting ? 'Đang xử lý...' : (editingStudent ? 'Cập nhật' : 'Tạo mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLySinhVien;
