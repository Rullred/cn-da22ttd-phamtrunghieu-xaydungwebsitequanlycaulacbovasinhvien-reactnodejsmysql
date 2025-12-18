const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Sử dụng đường dẫn tuyệt đối trong container Docker
    const uploadPath = path.join(__dirname, '../public/images');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// Lọc file chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (JPEG, JPG, PNG, GIF)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: fileFilter
});

module.exports = upload;
