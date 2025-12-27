const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || "bi_mat_khong_bat_mi";

// ĐĂNG KÝ (Dùng để tạo acc Admin/Staff ban đầu)
exports.register = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    // Check trùng email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email đã tồn tại" });

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'CUSTOMER' // ADMIN, WAITER, KITCHEN
      }
    });

    res.json({ message: "Tạo tài khoản thành công", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ĐĂNG NHẬP
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Sai email hoặc mật khẩu" });

    // Check pass
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Sai email hoặc mật khẩu" });

    // Tạo Token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      user: { id: user.id, name: user.name, role: user.role } 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};