import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tạo axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, mat_khau) => api.post('/auth/login', { email, mat_khau }),
  register: (data) => api.post('/auth/register', data),
  createProfile: (formData) => api.post('/auth/create-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, mat_khau_moi) => api.post('/auth/reset-password', { token, mat_khau_moi }),
  resetPasswordDirect: (email, mat_khau_moi) => api.post('/auth/reset-password-direct', { email, mat_khau_moi })
};

// Admin services
export const adminService = {
  getPendingAccounts: () => api.get('/admin/pending-accounts'),
  approveAccount: (id) => api.post(`/admin/approve-account/${id}`),
  rejectAccount: (id, ly_do) => api.post(`/admin/reject-account/${id}`, { ly_do }),
  getPendingActivities: () => api.get('/admin/pending-activities'),
  approveActivity: (id) => api.post(`/admin/approve-activity/${id}`),
  rejectActivity: (id, ly_do) => api.post(`/admin/reject-activity/${id}`, { ly_do }),
  createClub: (data) => api.post('/admin/create-club', data),
  createClubAdmin: (data) => api.post('/admin/create-club-admin', data),
  getClubs: () => api.get('/admin/clubs'),
  deleteClub: (id) => api.delete(`/admin/club/${id}`),
  getStatistics: () => api.get('/admin/statistics'),
  // Quản lý sinh viên
  getStudents: (search) => api.get('/admin/students', { params: { search } }),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`)
};

// Sinh viên services
export const sinhvienService = {
  getActivities: () => api.get('/sinhvien/activities'),
  getActivity: (id) => api.get(`/sinhvien/activity/${id}`),
  registerActivity: (id, ghi_chu) => api.post(`/sinhvien/register-activity/${id}`, { ghi_chu }),
  cancelRegistration: (id) => api.delete(`/sinhvien/cancel-registration/${id}`),
  getMyActivities: () => api.get('/sinhvien/my-activities'),
  joinClub: (clb_id) => api.post(`/sinhvien/join-club/${clb_id}`),
  updateProfile: (data) => api.put('/sinhvien/profile', data)
};

// Câu lạc bộ services
export const clbService = {
  getMyClub: () => api.get('/caulacbo/my-club'),
  createActivity: (data) => api.post('/caulacbo/create-activity', data),
  getActivities: () => api.get('/caulacbo/activities'),
  getActivityRegistrations: (id) => api.get(`/caulacbo/activity-registrations/${id}`),
  approveRegistration: (id) => api.post(`/caulacbo/approve-registration/${id}`),
  rejectRegistration: (id, ly_do) => api.post(`/caulacbo/reject-registration/${id}`, { ly_do }),
  getMemberRequests: () => api.get('/caulacbo/member-requests'),
  approveMember: (id) => api.post(`/caulacbo/approve-member/${id}`),
  rejectMember: (id) => api.post(`/caulacbo/reject-member/${id}`),
  getMembers: () => api.get('/caulacbo/members'),
  removeMember: (id) => api.delete(`/caulacbo/remove-member/${id}`),
  updateActivity: (id, data) => api.put(`/caulacbo/activity/${id}`, data),
  deleteActivity: (id) => api.delete(`/caulacbo/activity/${id}`)
};

// Hoạt động services (public)
export const hoatdongService = {
  getAll: () => api.get('/hoatdong'),
  getById: (id) => api.get(`/hoatdong/${id}`)
};

// Thông báo services
export const thongbaoService = {
  getNotifications: () => api.get('/thongbao'),
  markAsRead: (id) => api.put(`/thongbao/read/${id}`),
  markAllAsRead: () => api.put('/thongbao/read-all'),
  deleteNotification: (id) => api.delete(`/thongbao/${id}`),
  getUnreadCount: () => api.get('/thongbao/unread-count')
};

export default api;
