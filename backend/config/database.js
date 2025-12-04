const mysql = require('mysql2');
require('dotenv').config();

// Cấu hình kết nối database cho Docker
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ql_clb_sv',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+07:00' // Vietnam timezone
};

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// Hàm kết nối với retry logic cho Docker
const connectWithRetry = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Lỗi kết nối database:', err.message);
      console.log('Thử kết nối lại sau 5 giây...');
      setTimeout(connectWithRetry, 5000);
      return;
    }
    console.log('✓ Kết nối database MySQL thành công!');
    console.log(`✓ Host: ${dbConfig.host}`);
    console.log(`✓ Database: ${dbConfig.database}`);
    connection.release();
  });
};

// Khởi tạo kết nối
connectWithRetry();

// Xử lý lỗi kết nối
pool.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Kết nối database bị mất, thử kết nối lại...');
    connectWithRetry();
  } else {
    throw err;
  }
});

module.exports = promisePool;
