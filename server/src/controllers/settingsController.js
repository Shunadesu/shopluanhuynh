import SiteSetting from '../models/SiteSetting.js';
import Slider from '../models/Slider.js';
import Notification from '../models/Notification.js';

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    const settings = await SiteSetting.find();
    
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update site settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const settings = req.body; // Object of key-value pairs

    const updates = [];
    for (const [key, value] of Object.entries(settings)) {
      const update = await SiteSetting.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
      updates.push(update);
    }

    res.json({ message: 'Settings updated successfully', settings: updates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active sliders
// @route   GET /api/sliders
// @access  Public
export const getSliders = async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sliders (admin)
// @route   GET /api/admin/sliders
// @access  Private/Admin
export const getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1 });
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create slider
// @route   POST /api/admin/sliders
// @access  Private/Admin
export const createSlider = async (req, res) => {
  try {
    const { title, image, link, order, isActive } = req.body;

    const slider = await Slider.create({
      title,
      image,
      link,
      order,
      isActive
    });

    res.status(201).json(slider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update slider
// @route   PUT /api/admin/sliders/:id
// @access  Private/Admin
export const updateSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    const { title, image, link, order, isActive } = req.body;

    slider.title = title !== undefined ? title : slider.title;
    slider.image = image || slider.image;
    slider.link = link !== undefined ? link : slider.link;
    slider.order = order !== undefined ? order : slider.order;
    slider.isActive = isActive !== undefined ? isActive : slider.isActive;

    const updatedSlider = await slider.save();
    res.json(updatedSlider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete slider
// @route   DELETE /api/admin/sliders/:id
// @access  Private/Admin
export const deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    await slider.deleteOne();
    res.json({ message: 'Slider deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active notifications
// @route   GET /api/notifications
// @access  Public
export const getNotifications = async (req, res) => {
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
};

// @desc    Get all notifications (admin)
// @route   GET /api/admin/notifications
// @access  Private/Admin
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ order: 1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create notification
// @route   POST /api/admin/notifications
// @access  Private/Admin
export const createNotification = async (req, res) => {
  try {
    const { type, title, content, image, order, isActive, startDate, endDate, dismissible, dismissDuration } = req.body;

    const notification = await Notification.create({
      type,
      title,
      content,
      image,
      order,
      isActive,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      dismissible: dismissible !== undefined ? dismissible : true,
      dismissDuration: dismissDuration || 24
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update notification
// @route   PUT /api/admin/notifications/:id
// @access  Private/Admin
export const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const { type, title, content, image, order, isActive, startDate, endDate, dismissible, dismissDuration } = req.body;

    notification.type = type || notification.type;
    notification.title = title !== undefined ? title : notification.title;
    notification.content = content || notification.content;
    notification.image = image !== undefined ? image : notification.image;
    notification.order = order !== undefined ? order : notification.order;
    notification.isActive = isActive !== undefined ? isActive : notification.isActive;
    notification.startDate = startDate !== undefined ? (startDate ? new Date(startDate) : null) : notification.startDate;
    notification.endDate = endDate !== undefined ? (endDate ? new Date(endDate) : null) : notification.endDate;
    notification.dismissible = dismissible !== undefined ? dismissible : notification.dismissible;
    notification.dismissDuration = dismissDuration || notification.dismissDuration;

    const updatedNotification = await notification.save();
    res.json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/admin/notifications/:id
// @access  Private/Admin
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
