import express from 'express';
import {
  getSettings,
  updateSettings,
  getSliders,
  getAllSliders,
  createSlider,
  updateSlider,
  deleteSlider,
  getNotifications,
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification
} from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getSettings);
router.get('/sliders', getSliders);
router.get('/notifications', getNotifications);

// Admin settings routes
router.put('/admin', protect, admin, updateSettings);

// Admin slider routes
router.get('/admin/sliders', protect, admin, getAllSliders);
router.post('/admin/sliders', protect, admin, createSlider);
router.put('/admin/sliders/:id', protect, admin, updateSlider);
router.delete('/admin/sliders/:id', protect, admin, deleteSlider);

// Admin notification routes
router.get('/admin/notifications', protect, admin, getAllNotifications);
router.post('/admin/notifications', protect, admin, createNotification);
router.put('/admin/notifications/:id', protect, admin, updateNotification);
router.delete('/admin/notifications/:id', protect, admin, deleteNotification);

export default router;
