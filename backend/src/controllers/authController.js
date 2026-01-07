const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ email và mật khẩu' });
      }

      const result = await authService.login(email, password);
      
      return res.status(200).json({
        message: 'Đăng nhập thành công',
        ...result
      });
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  }

  async register(req, res) {
    try {
      const { fullName, email, password } = req.body;
      const user = await authService.register(fullName, email, password);
      res.status(201).json({ message: 'Tạo tài khoản thành công', user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();