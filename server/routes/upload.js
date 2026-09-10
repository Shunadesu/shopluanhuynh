import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload ảnh (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Helper to get full URL for uploaded files
const getFileUrl = (req, filename) => {
  // Check for forwarded protocol (when behind proxy like Nginx)
  const protocol = req.get('X-Forwarded-Proto') || req.protocol;
  const host = req.get('X-Forwarded-Host') || req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
};

// Upload single image
router.post('/image', adminAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file' });
    }

    // Trả về đường dẫn tương đối để frontend tự build full URL theo môi trường
    const imagePath = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Upload thành công',
      url: imagePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Lỗi upload', error: error.message });
  }
});

// Upload multiple images
router.post('/images', adminAuth, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Vui lòng chọn file' });
    }

    // Trả về đường dẫn tương đối
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

    res.json({
      message: 'Upload thành công',
      urls: imagePaths
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Lỗi upload', error: error.message });
  }
});

export default router;
