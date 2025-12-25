const fs = require('fs');

// Đọc file SQL
const filePath = '../database/migrations/insert_da22ttd_students.sql';
let sql = fs.readFileSync(filePath, 'utf8');

// Thêm N trước các chuỗi có tiếng Việt (trong VALUES)
// Pattern: VALUES (LAST_INSERT_ID(), 'Tên tiếng Việt', ...)
sql = sql.replace(/VALUES \(LAST_INSERT_ID\(\), '([^']+)', '(\d+)', '([^']+)', '([^']+)',/g, 
    "VALUES (LAST_INSERT_ID(), N'$1', '$2', N'$3', N'$4',");

// Ghi lại file
fs.writeFileSync(filePath, sql);
console.log('Đã thêm N vào các chuỗi tiếng Việt trong file SQL!');
