const fs = require('fs');

// Đọc file SQL
let sql = fs.readFileSync('../database/migrations/insert_da22ttd_students.sql', 'utf8');

// Thay đổi CNTT thành Công Nghệ Thông Tin
sql = sql.replace(/N'CNTT'/g, "N'Công Nghệ Thông Tin'");
sql = sql.replace(/Khoa: CNTT/g, 'Khoa: Công Nghệ Thông Tin');

// Ghi lại file
fs.writeFileSync('../database/migrations/insert_da22ttd_students.sql', sql);

console.log('✅ Đã thay đổi CNTT thành Công Nghệ Thông Tin!');
