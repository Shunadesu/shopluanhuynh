import express from 'express';
import SpinReward from '../models/SpinReward.js';
import SpinHistory from '../models/SpinHistory.js';
import SiteSetting from '../models/SiteSetting.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all rewards (admin view)
router.get('/rewards', adminAuth, async (req, res) => {
  try {
    const rewards = await SpinReward.find()
      .populate('accountId', 'title price images')
      .sort({ createdAt: -1 });

    res.json(rewards);
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create reward
router.post('/rewards', adminAuth, async (req, res) => {
  try {
    console.log('📝 Create reward request body:', JSON.stringify(req.body, null, 2));
    
    const {
      label,
      rewardType,
      value,
      accountId,
      voucherCode,
      voucherDiscount,
      probability,
      color,
      icon,
      stock
    } = req.body;

    // Validate required fields
    if (!label || !rewardType || probability === undefined) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Validate rewardType
    const validRewardTypes = ['cash', 'account', 'voucher', 'nothing'];
    if (!validRewardTypes.includes(rewardType)) {
      return res.status(400).json({ 
        message: 'RewardType không hợp lệ',
        detail: `Giá trị nhận được: "${rewardType}". Chỉ chấp nhận: ${validRewardTypes.join(', ')}`
      });
    }

    // Validate probability
    if (probability < 0 || probability > 100) {
      return res.status(400).json({ message: 'Xác suất phải từ 0-100' });
    }

    // Check total probability doesn't exceed 100
    const existingRewards = await SpinReward.find({ isActive: true, _id: { $exists: true } });
    const totalProb = existingRewards.reduce((sum, r) => sum + r.probability, 0);
    
    if (totalProb + probability > 100) {
      return res.status(400).json({ 
        message: `Tổng xác suất vượt quá 100%. Hiện tại: ${totalProb}%, thêm ${probability}% = ${totalProb + probability}%` 
      });
    }

    const reward = new SpinReward({
      label,
      rewardType,
      value: value || 0,
      accountId: accountId || null,
      voucherCode: voucherCode || '',
      voucherDiscount: voucherDiscount || 0,
      probability,
      color: color || '#FF6D00',
      icon: icon || '',
      stock: stock !== undefined ? stock : null
    });

    await reward.save();
    await reward.populate('accountId', 'title price images');

    res.status(201).json(reward);
  } catch (error) {
    console.error('Create reward error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update reward
router.put('/rewards/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      label,
      rewardType,
      value,
      accountId,
      voucherCode,
      voucherDiscount,
      probability,
      color,
      icon,
      stock,
      isActive
    } = req.body;

    const reward = await SpinReward.findById(id);
    if (!reward) {
      return res.status(404).json({ message: 'Phần thưởng không tồn tại' });
    }

    // Validate probability if changed
    if (probability !== undefined && (probability < 0 || probability > 100)) {
      return res.status(400).json({ message: 'Xác suất phải từ 0-100' });
    }

    // Check total probability
    if (probability !== undefined && probability !== reward.probability) {
      const existingRewards = await SpinReward.find({ 
        isActive: true,
        _id: { $ne: id }
      });
      const totalProb = existingRewards.reduce((sum, r) => sum + r.probability, 0);
      
      if (totalProb + probability > 100) {
        return res.status(400).json({ 
          message: `Tổng xác suất vượt quá 100%. Hiện tại: ${totalProb}%, thêm ${probability}% = ${totalProb + probability}%` 
        });
      }
    }

    // Update fields
    if (label !== undefined) reward.label = label;
    if (rewardType !== undefined) reward.rewardType = rewardType;
    if (value !== undefined) reward.value = value;
    if (accountId !== undefined) reward.accountId = accountId || null;
    if (voucherCode !== undefined) reward.voucherCode = voucherCode;
    if (voucherDiscount !== undefined) reward.voucherDiscount = voucherDiscount;
    if (probability !== undefined) reward.probability = probability;
    if (color !== undefined) reward.color = color;
    if (icon !== undefined) reward.icon = icon;
    if (stock !== undefined) reward.stock = stock;
    if (isActive !== undefined) reward.isActive = isActive;

    await reward.save();
    await reward.populate('accountId', 'title price images');

    res.json(reward);
  } catch (error) {
    console.error('Update reward error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete reward
router.delete('/rewards/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const reward = await SpinReward.findById(id);
    if (!reward) {
      return res.status(404).json({ message: 'Phần thưởng không tồn tại' });
    }

    await SpinReward.findByIdAndDelete(id);
    
    res.json({ message: 'Đã xóa phần thưởng' });
  } catch (error) {
    console.error('Delete reward error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get spin statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.spinAt = {};
      if (startDate) filter.spinAt.$gte = new Date(startDate);
      if (endDate) filter.spinAt.$lte = new Date(endDate);
    }

    // Total spins
    const totalSpins = await SpinHistory.countDocuments(filter);

    // Total rewards given
    const rewardStats = await SpinHistory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$rewardType',
          count: { $sum: 1 },
          totalValue: { $sum: '$rewardValue' }
        }
      }
    ]);

    // Recent spins
    const recentSpins = await SpinHistory.find(filter)
      .populate('userId', 'username fullName')
      .populate('accountId', 'title price')
      .sort({ spinAt: -1 })
      .limit(50);

    res.json({
      totalSpins,
      rewardStats,
      recentSpins
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Toggle spin feature
router.post('/toggle', adminAuth, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    let setting = await SiteSetting.findOne({ key: 'spin_enabled' });
    
    if (!setting) {
      setting = new SiteSetting({
        key: 'spin_enabled',
        value: enabled ? 'true' : 'false'
      });
    } else {
      setting.value = enabled ? 'true' : 'false';
    }
    
    await setting.save();
    
    res.json({ message: `Đã ${enabled ? 'bật' : 'tắt'} tính năng vòng quay`, enabled });
  } catch (error) {
    console.error('Toggle spin error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
