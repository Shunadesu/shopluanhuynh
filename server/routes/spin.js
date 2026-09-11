import express from 'express';
import mongoose from 'mongoose';
import SpinReward from '../models/SpinReward.js';
import SpinHistory from '../models/SpinHistory.js';
import User from '../models/User.js';
import GameAccount from '../models/GameAccount.js';
import SiteSetting from '../models/SiteSetting.js';
import { auth } from '../middleware/auth.js';
import { spinLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Get spin configuration for user (active rewards only)
router.get('/config', auth, async (req, res) => {
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

// Get user's spin counts
router.get('/my-spins', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('spins totalSpent');
    
    res.json({
      spins: user.spins || 0,
      totalSpent: user.totalSpent || 0
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
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const history = await SpinHistory.find({ userId: req.user._id })
      .populate('accountId', 'title price images')
      .sort({ spinAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SpinHistory.countDocuments({ userId: req.user._id });

    res.json({
      history,
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

export default router;
