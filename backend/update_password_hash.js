const fs = require('fs');
const bcrypt = require('bcryptjs');

// Tạo hash thật cho mật khẩu "1234567"
const hash = bcrypt.hashSync('1234567', 10);
console.log('Hash mới:', hash);

// Đọc file SQL
const filePath = '../database/migrations/insert_da22ttd_students.sql';
let sql = fs.readFileSync(filePath, 'utf8');

// Thay thế hash giả bằng hash thật
const fakeHash = '$2a$10$8K1p/a0dL3JzLPU4aJXE/O.HMeJnLYvH8QKxEiVpCx2w8YQ3UJK8a';
sql = sql.split(fakeHash).join(hash);

// Ghi lại file
fs.writeFileSync(filePath, sql);
console.log('Đã cập nhật hash mật khẩu thành công!');
console.log('Tất cả tài khoản giờ có thể đăng nhập bằng mật khẩu: 1234567');
