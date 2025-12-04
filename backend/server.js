const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Set timezone to Vietnam
process.env.TZ = 'Asia/Ho_Chi_Minh';

const passport = require('./config/passport');
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const sinhvienRoutes = require('./routes/sinhvien');
const caulacboRoutes = require('./routes/caulacbo');
const hoatdongRoutes = require('./routes/hoatdong');
const thongbaoRoutes = require('./routes/thongbao');

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
// Session configuration (using MemoryStore for development)
// For production, consider using connect-redis or connect-mongo
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set true nếu dùng HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 giờ
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use('/public', express.static(path.join(__dirname, '../public')));

// Socket.io - Lưu các kết nối socket theo userId
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
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
