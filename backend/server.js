const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Set timezone to Vietnam
process.env.TZ = 'Asia/Ho_Chi_Minh';

const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const sinhvienRoutes = require('./routes/sinhvien');
const caulacboRoutes = require('./routes/caulacbo');
const hoatdongRoutes = require('./routes/hoatdong');
const thongbaoRoutes = require('./routes/thongbao');
const danhgiaRoutes = require('./routes/danhgia');
const chatRoutes = require('./routes/chat');
const danhsachRoutes = require('./routes/danhsach');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Socket.io - Lưu các kết nối socket theo userId
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Join chat room
  socket.on('join_room', (roomId) => {
    socket.join(`room_${roomId}`);
    console.log(`Socket ${socket.id} joined room_${roomId}`);
  });

  // Leave chat room
  socket.on('leave_room', (roomId) => {
    socket.leave(`room_${roomId}`);
    console.log(`Socket ${socket.id} left room_${roomId}`);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(`room_${data.roomId}`).emit('user_typing', {
      userId: data.userId,
      userName: data.userName
    });
  });

  socket.on('stop_typing', (data) => {
    socket.to(`room_${data.roomId}`).emit('user_stop_typing', {
      userId: data.userId
    });
  });

  socket.on('disconnect', () => {
    // Xóa socket khi ngắt kết nối
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Làm cho io có thể truy cập từ routes
app.set('io', io);
app.set('userSockets', userSockets);

// Log middleware - debug requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sinhvien', sinhvienRoutes);
app.use('/api/caulacbo', caulacboRoutes);
app.use('/api/hoatdong', hoatdongRoutes);
app.use('/api/thongbao', thongbaoRoutes);
app.use('/api/danhgia', danhgiaRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/danhsach', danhsachRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route mặc định
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hệ thống quản lý CLB và hoạt động sinh viên - TVU',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Đã xảy ra lỗi!', 
    error: err.message 
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✓ Server đang chạy trên port ${PORT}`);
});
