const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
  // 1. Lấy token từ header "Authorization: Bearer <token>"
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập (Thiếu token)' });
  }

  try {
    // 2. Xác thực token
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    
    // 3. Lưu thông tin user đã decode vào đối tượng req để các hàm sau sử dụng
    req.user = decoded; 
    next(); // Cho phép đi tiếp vào Controller
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};