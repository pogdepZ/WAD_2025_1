const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); // 1. Import HTTP
const { Server } = require('socket.io'); // 2. Import Socket.IO

// Import Routes
const menuRoutes = require('./routes/menuRoutes');
const tableRoutes = require('./routes/tableRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); 

dotenv.config();

const app = express();
const server = http.createServer(app); // 3. Tạo HTTP Server từ Express App

const PORT = process.env.PORT || 5000;

// 4. Cấu hình Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép mọi nguồn (Frontend) kết nối
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// 5. QUAN TRỌNG: Inject 'io' vào 'req' để Controller dùng được
app.use((req, res, next) => {
  req.io = io; 
  next();
});

// Socket Events (Lắng nghe kết nối)
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join Room: Waiter hoặc Kitchen join vào phòng riêng
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Test Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running!' });
});

// 6. Đăng ký Routes
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/modifiers', require('./routes/modifierRoutes'));
app.use('/upload', require('./routes/uploadRoutes'));



// 7. Thay app.listen bằng server.listen
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});