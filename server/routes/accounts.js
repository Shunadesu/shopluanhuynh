import express from 'express';
import GameAccount from '../models/GameAccount.js';
import { auth } from '../middleware/auth.js';
import { decrypt } from '../utils/encryption.js';

const router = express.Router();

// Get all accounts with filters
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;

    const query = { status: 'available' };

    if (category) {
      query.categoryId = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { rank: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const accounts = await GameAccount.find(query)
      .populate('categoryId', 'name slug')
      .select('-username -password') // Hide credentials
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GameAccount.countDocuments(query);

    res.json({
      accounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get account by ID
router.get('/:id', async (req, res) => {
  try {
    const account = await GameAccount.findById(req.params.id)
      .populate('categoryId', 'name slug');

    if (!account) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    // If account is sold and user owns it, decrypt credentials
    if (account.status === 'sold' && req.user && account.soldTo && account.soldTo.toString() === req.user._id.toString()) {
      account.username = decrypt(account.username);
      account.password = decrypt(account.password);
    } else {
      // Hide credentials if not purchased
      account.username = undefined;
      account.password = undefined;
    }

    res.json(account);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
