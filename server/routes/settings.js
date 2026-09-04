import express from 'express';
import SiteSetting from '../models/SiteSetting.js';

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

export default router;
