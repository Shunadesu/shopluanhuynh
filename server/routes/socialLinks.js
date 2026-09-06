import express from 'express';
import SocialLink from '../models/SocialLink.js';
import { auth as protect, adminAuth as admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all active social links (public)
// @route   GET /api/social-links
// @access  Public
router.get('/', async (req, res) => {
  try {
    const socialLinks = await SocialLink.find({ isActive: true }).sort({ order: 1 });
    res.json(socialLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all social links (admin)
// @route   GET /api/admin/social-links
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const socialLinks = await SocialLink.find().sort({ order: 1 });
    res.json(socialLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create social link
// @route   POST /api/admin/social-links
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, url, platform, icon, order, isActive } = req.body;

    const socialLink = await SocialLink.create({
      name,
      url,
      platform: platform || 'other',
      icon: icon || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(socialLink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update social link
// @route   PUT /api/admin/social-links/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const socialLink = await SocialLink.findById(req.params.id);

    if (!socialLink) {
      return res.status(404).json({ message: 'Social link not found' });
    }

    const { name, url, platform, icon, order, isActive } = req.body;

    socialLink.name = name || socialLink.name;
    socialLink.url = url || socialLink.url;
    socialLink.platform = platform || socialLink.platform;
    socialLink.icon = icon !== undefined ? icon : socialLink.icon;
    socialLink.order = order !== undefined ? order : socialLink.order;
    socialLink.isActive = isActive !== undefined ? isActive : socialLink.isActive;

    const updatedSocialLink = await socialLink.save();
    res.json(updatedSocialLink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete social link
// @route   DELETE /api/admin/social-links/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const socialLink = await SocialLink.findById(req.params.id);

    if (!socialLink) {
      return res.status(404).json({ message: 'Social link not found' });
    }

    await socialLink.deleteOne();
    res.json({ message: 'Social link deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
