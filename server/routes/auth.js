import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Helper: tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Helper: trả về thông tin user an toàn (không có password)
const safeUser = (user) => ({
  _id: user._id,
  username: user.username,
  fullName: user.fullName,
  phone: user.phone,
  balance: user.balance,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt
});

// POST /api/auth/register - Đăng ký tài khoản mới
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, phone } = req.body;

    // Validate cơ bản
    if (!username || !password || !fullName) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Kiểm tra username đã tồn tại
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng' });
    }

    // Tạo user (pre-save hook sẽ hash password)
    const user = await User.create({
      username: username.toLowerCase().trim(),
      password,
      fullName: fullName.trim(),
      phone: phone || ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: safeUser(user)
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/auth/login - Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Tài khoản đã bị khóa' });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: safeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/auth/me - Lấy thông tin user hiện tại
router.get('/me', auth, async (req, res) => {
  try {
    res.json(safeUser(req.user));
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
