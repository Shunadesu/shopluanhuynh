import express from 'express';
import GameAccount from '../models/GameAccount.js';
import { auth } from '../middleware/auth.js';
import { decrypt } from '../utils/encryption.js';

const router = express.Router();

// Get all accounts with filters
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, minPrice, maxPrice, search, code, sortBy, page = 1, limit = 12 } = req.query;

    const query = { status: 'available' };

    if (category) {
      query.categoryId = category;
    }

    // Filter by subcategory - subcategory is just a category with parentId
    if (subcategory) {
      query.categoryId = subcategory;
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

    if (code) {
      query.code = { $regex: code, $options: 'i' };
    }

    // Determine sort order
    let sortOptions = { createdAt: -1 }; // default
    if (sortBy) {
      switch(sortBy) {
        case 'price_asc':
          sortOptions = { price: 1 };
          break;
        case 'price_desc':
          sortOptions = { price: -1 };
          break;
        case 'name_asc':
          sortOptions = { title: 1 };
          break;
        case 'name_desc':
          sortOptions = { title: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const accounts = await GameAccount.find(query)
      .populate('categoryId', 'name slug parentId')
      .select('-username -password') // Hide credentials
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Map categoryId to category for frontend compatibility
    const mappedAccounts = accounts.map(acc => {
      const accObj = acc.toObject();
      accObj.category = accObj.categoryId;
      return accObj;
    });

    const total = await GameAccount.countDocuments(query);

    res.json({
      accounts: mappedAccounts,
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

    // Map categoryId to category for frontend compatibility
    const accountObj = account.toObject();
    accountObj.category = accountObj.categoryId;

    // If account is sold and user owns it, decrypt credentials
    if (account.status === 'sold' && req.user && account.soldTo && account.soldTo.toString() === req.user._id.toString()) {
      accountObj.username = decrypt(accountObj.username);
      accountObj.password = decrypt(accountObj.password);
      accountObj.password2 = decrypt(accountObj.password2 || '');
    } else {
      // Hide credentials if not purchased
      accountObj.username = undefined;
      accountObj.password = undefined;
      accountObj.password2 = undefined;
    }

    res.json(accountObj);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
