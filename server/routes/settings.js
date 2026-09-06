import express from 'express';
import SiteSetting from '../models/SiteSetting.js';
import Notification from '../models/Notification.js';
import Slider from '../models/Slider.js';

const router = express.Router();

// Get all public settings
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSetting.find();
    
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get logo header
router.get('/logo-header', async (req, res) => {
  try {
    const logo = await SiteSetting.findOne({ key: 'logo_header' });
    res.json({ logo: logo?.value || null });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get logo footer
router.get('/logo-footer', async (req, res) => {
  try {
    const logo = await SiteSetting.findOne({ key: 'logo_footer' });
    res.json({ logo: logo?.value || null });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get active sliders
router.get('/sliders', async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get active notifications
router.get('/notifications', async (req, res) => {
  try {
    const now = new Date();
    
    const notifications = await Notification.find({
      isActive: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $gte: now } }
      ]
    }).sort({ order: 1 });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
