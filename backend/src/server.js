const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');

const app = express();

// Middleware
app.use(cors()); // Cho phép Frontend react gọi vào
app.use(express.json()); // Đọc dữ liệu JSON gửi lên
app.use(morgan('dev')); // Log request

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes); // 

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Restaurant API (Single Tenant) is running...' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});