import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private (can be used by both users and admins)
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Image uploaded successfully',
      filename: req.file.filename,
      url: fileUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post('/images', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const fileUrls = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`
    }));

    res.json({
      message: 'Images uploaded successfully',
      files: fileUrls
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
