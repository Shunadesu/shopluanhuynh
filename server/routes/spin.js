import express from 'express';
import mongoose from 'mongoose';
import SpinReward from '../models/SpinReward.js';
import SpinHistory from '../models/SpinHistory.js';
import User from '../models/User.js';
import GameAccount from '../models/GameAccount.js';
import SiteSetting from '../models/SiteSetting.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/auth.js';
import { spinLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Get spin configuration for user (active rewards only) - PUBLIC so guests can view the wheel
router.get('/config', async (req, res) => {
  try {
    // Check if spin feature is enabled
    const spinEnabled = await SiteSetting.findOne({ key: 'spin_enabled' });
    if (spinEnabled && spinEnabled.value === 'false') {
      return res.status(403).json({ message: 'Tính năng vòng quay tạm thời không khả dụng' });
    }

    const rewards = await SpinReward.find({
      isActive: true,
      $or: [
        { stock: null },
        { stock: { $gt: 0 } }
      ]
    }).populate('accountId', 'title price images').sort({ probability: -1 });

    // Transform for wheel display
    const wheelData = rewards.map(reward => ({
      _id: reward._id,
      label: reward.label,
      type: reward.rewardType,
      value: reward.value,
      accountId: reward.accountId?._id,
      voucherCode: reward.voucherCode,
      voucherDiscount: reward.voucherDiscount,
      probability: reward.probability,
      color: reward.color
    }));

    res.json(wheelData);
  } catch (error) {
    console.error('Get spin config error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get user's spin counts - PUBLIC (returns 0 for guests)
router.get('/my-spins', async (req, res) => {
  try {
    // Try to read user from optional auth header
    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {
        // Token invalid/expired, treat as guest
        userId = null;
      }
    }

    if (!userId) {
      return res.json({ spins: 0, totalDeposited: 0, isAuthenticated: false });
    }

    const user = await User.findById(userId).select('spins totalDeposited');

    if (!user) {
      return res.json({ spins: 0, totalDeposited: 0, isAuthenticated: false });
    }

    res.json({
      spins: user.spins || 0,
      totalDeposited: user.totalDeposited || 0,
      isAuthenticated: true
    });
  } catch (error) {
    console.error('Get my spins error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Spin wheel - WITH TRANSACTION + RATE LIMITING
router.post('/spin', auth, spinLimiter, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if spin feature is enabled
    const spinEnabled = await SiteSetting.findOne({ key: 'spin_enabled' }).session(session);
    if (spinEnabled && spinEnabled.value === 'false') {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Tính năng vòng quay tạm thời không khả dụng' });
    }

    // Get user with lock
    const user = await User.findOne({
      _id: req.user._id,
      spins: { $gt: 0 }
    }).session(session);

    if (!user) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Bạn không có lượt quay' });
    }

    // Get active rewards with stock
    const rewards = await SpinReward.find({
      isActive: true,
      $or: [
        { stock: null },
        { stock: { $gt: 0 } }
      ]
    }).populate('accountId').session(session);

    if (rewards.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Không có phần thưởng khả dụng' });
    }

    // Calculate weighted random selection
    const totalProbability = rewards.reduce((sum, r) => sum + r.probability, 0);
    let random = Math.random() * totalProbability;
    
    let selectedReward = null;
    for (const reward of rewards) {
      random -= reward.probability;
      if (random <= 0) {
        selectedReward = reward;
        break;
      }
    }

    // Fallback to first reward if calculation fails
    if (!selectedReward) {
      selectedReward = rewards[0];
    }

    // Initialize reward data
    let rewardData = {
      rewardType: selectedReward.rewardType,
      rewardLabel: selectedReward.label,
      rewardValue: 0,
      accountId: null,
      voucherCode: '',
      voucherDiscount: 0,
      account: null
    };

    // Handle different reward types with atomic operations
    if (selectedReward.rewardType === 'cash') {
      // Add cash to user balance
      rewardData.rewardValue = selectedReward.value;
      user.balance += selectedReward.value;
      
    } else if (selectedReward.rewardType === 'account' && selectedReward.accountId) {
      // Atomically assign account to user (prevent double assignment)
      const account = await GameAccount.findOneAndUpdate(
        {
          _id: selectedReward.accountId._id,
          status: 'available'
        },
        {
          $set: {
            status: 'sold',
            buyer: user._id,
            soldAt: new Date()
          }
        },
        { 
          returnDocument: 'after',
          session
        }
      );

      if (account) {
        rewardData.accountId = account._id;
        rewardData.account = {
          title: account.title,
          price: account.price,
          images: account.images
        };

        // Decrease stock atomically
        if (selectedReward.stock !== null) {
          await SpinReward.findByIdAndUpdate(
            selectedReward._id,
            { $inc: { stock: -1 } },
            { session }
          );
        }
      } else {
        // Account not available, fallback to "nothing" reward
        console.warn(`Account ${selectedReward.accountId._id} not available, user ${user._id} gets nothing`);
        rewardData.rewardType = 'nothing';
        rewardData.rewardLabel = 'Chúc bạn may mắn lần sau';
      }
      
    } else if (selectedReward.rewardType === 'voucher') {
      rewardData.voucherCode = selectedReward.voucherCode;
      rewardData.voucherDiscount = selectedReward.voucherDiscount;
      
      // Decrease stock atomically
      if (selectedReward.stock !== null) {
        const updatedReward = await SpinReward.findOneAndUpdate(
          {
            _id: selectedReward._id,
            stock: { $gt: 0 }
          },
          { $inc: { stock: -1 } },
          { returnDocument: 'after', session }
        );

        if (!updatedReward) {
          // Stock depleted, fallback to "nothing"
          console.warn(`Voucher ${selectedReward._id} out of stock, user ${user._id} gets nothing`);
          rewardData.rewardType = 'nothing';
          rewardData.rewardLabel = 'Chúc bạn may mắn lần sau';
          rewardData.voucherCode = '';
          rewardData.voucherDiscount = 0;
        }
      }
    }

    // Deduct spin count
    user.spins -= 1;
    await user.save({ session });

    // Save spin history
    const history = new SpinHistory({
      userId: user._id,
      rewardType: rewardData.rewardType,
      rewardLabel: rewardData.rewardLabel,
      rewardValue: rewardData.rewardValue,
      accountId: rewardData.accountId,
      voucherCode: rewardData.voucherCode,
      voucherDiscount: rewardData.voucherDiscount
    });
    await history.save({ session });

    // Commit transaction
    await session.commitTransaction();

    res.json({
      success: true,
      reward: {
        type: rewardData.rewardType,
        label: rewardData.rewardLabel,
        value: rewardData.rewardValue,
        account: rewardData.account,
        voucherCode: rewardData.voucherCode,
        voucherDiscount: rewardData.voucherDiscount
      },
      remainingSpins: user.spins
    });

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    
    // Handle write conflict errors (race condition)
    if (error.code === 112 || error.message.includes('Write conflict')) {
      console.warn('Write conflict detected, user should retry:', error.message);
      return res.status(409).json({ 
        message: 'Có nhiều người đang quay cùng lúc, vui lòng thử lại',
        shouldRetry: true
      });
    }
    
    console.error('Spin wheel error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  } finally {
    // End session
    session.endSession();
  }
});

// Get spin history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };

    if (startDate || endDate) {
      filter.spinAt = {};
      if (startDate) filter.spinAt.$gte = new Date(startDate);
      if (endDate) filter.spinAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const [history, total, stats] = await Promise.all([
      SpinHistory.find(filter)
        .populate('accountId', 'title price images')
        .sort({ spinAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SpinHistory.countDocuments(filter),
      SpinHistory.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: null,
            totalCash: { $sum: '$rewardValue' },
            totalSpins: { $sum: 1 },
            cashCount: {
              $sum: { $cond: [{ $eq: ['$rewardType', 'cash'] }, 1, 0] }
            },
            accountCount: {
              $sum: { $cond: [{ $eq: ['$rewardType', 'account'] }, 1, 0] }
            },
            voucherCount: {
              $sum: { $cond: [{ $eq: ['$rewardType', 'voucher'] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    res.json({
      history,
      stats: stats[0] || { totalCash: 0, totalSpins: 0, cashCount: 0, accountCount: 0, voucherCount: 0 },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get spin history error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// =============================================
// ADMIN: Spin History Management
// =============================================

// Get all spin history (admin)
router.get('/admin/history', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      rewardType,
      startDate,
      endDate,
      search // search by username
    } = req.query;

    const filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (rewardType && rewardType !== 'all') {
      filter.rewardType = rewardType;
    }

    if (startDate || endDate) {
      filter.spinAt = {};
      if (startDate) filter.spinAt.$gte = new Date(startDate);
      if (endDate) filter.spinAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    if (search) {
      // Search by username — need to join with User
      const users = await User.find({
        username: { $regex: search, $options: 'i' }
      }).select('_id');
      filter.userId = { $in: users.map(u => u._id) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [history, total] = await Promise.all([
      SpinHistory.find(filter)
        .populate('userId', 'username fullName')
        .populate('accountId', 'title price')
        .sort({ spinAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SpinHistory.countDocuments(filter)
    ]);

    res.json({
      history,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Admin get spin history error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get spin statistics (admin)
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.spinAt = {};
      if (startDate) dateFilter.spinAt.$gte = new Date(startDate);
      if (endDate) dateFilter.spinAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const [
      totalSpins,
      cashRewards,
      accountRewards,
      voucherRewards,
      nothingRewards,
      topUsers,
      recentHistory
    ] = await Promise.all([
      // Total spins
      SpinHistory.countDocuments(dateFilter),

      // Cash rewards aggregate
      SpinHistory.aggregate([
        { $match: { ...dateFilter, rewardType: 'cash' } },
        { $group: { _id: null, totalValue: { $sum: '$rewardValue' }, count: { $sum: 1 } } }
      ]),

      // Account rewards count
      SpinHistory.countDocuments({ ...dateFilter, rewardType: 'account' }),

      // Voucher rewards count
      SpinHistory.countDocuments({ ...dateFilter, rewardType: 'voucher' }),

      // Nothing count
      SpinHistory.countDocuments({ ...dateFilter, rewardType: 'nothing' }),

      // Top 5 users by spin count
      SpinHistory.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$userId', spinCount: { $sum: 1 } } },
        { $sort: { spinCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 1,
            username: '$user.username',
            fullName: '$user.fullName',
            spinCount: 1
          }
        }
      ]),

      // Recent 10 spins
      SpinHistory.find(dateFilter)
        .populate('userId', 'username')
        .sort({ spinAt: -1 })
        .limit(10)
    ]);

    res.json({
      totalSpins,
      cashTotal: cashRewards[0]?.totalValue || 0,
      cashCount: cashRewards[0]?.count || 0,
      accountCount: accountRewards,
      voucherCount: voucherRewards,
      nothingCount: nothingRewards,
      topUsers,
      recentHistory
    });
  } catch (error) {
    console.error('Admin get spin stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
