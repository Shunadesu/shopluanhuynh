import express from 'express';
import Category from '../models/Category.js';
import GameAccount from '../models/GameAccount.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import DepositRequest from '../models/DepositRequest.js';
import BankAccount from '../models/BankAccount.js';
import Slider from '../models/Slider.js';
import Notification from '../models/Notification.js';
import SiteSetting from '../models/SiteSetting.js';
import { adminAuth } from '../middleware/auth.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const router = express.Router();

// ==================== DASHBOARD ====================

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalOrders = await Order.countDocuments({ status: 'completed' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const availableAccounts = await GameAccount.countDocuments({ status: 'available' });

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: today }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const todayOrders = await Order.countDocuments({
      status: 'completed',
      createdAt: { $gte: today }
    });

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalUsers,
      availableAccounts,
      todayRevenue: todayRevenue[0]?.total || 0,
      todayOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

router.get('/dashboard/stats', adminAuth, getDashboardStats);
router.get('/stats', adminAuth, getDashboardStats);

// Get revenue chart data
router.get('/dashboard/revenue-chart', adminAuth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(revenueData);
  } catch (error) {
    console.error('Get revenue chart error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get top categories
router.get('/dashboard/top-categories', adminAuth, async (req, res) => {
  try {
    const topCategories = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'gameaccounts',
          localField: 'items.accountId',
          foreignField: '_id',
          as: 'account'
        }
      },
      { $unwind: '$account' },
      {
        $lookup: {
          from: 'categories',
          localField: 'account.categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          name: { $first: '$category.name' },
          count: { $sum: 1 },
          revenue: { $sum: '$items.price' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    res.json(topCategories);
  } catch (error) {
    console.error('Get top categories error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get recent orders
router.get('/dashboard/recent-orders', adminAuth, async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .populate('userId', 'fullName username')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(recentOrders);
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ==================== CATEGORIES ====================

// Get all categories (admin) - with subcategories
router.get('/categories', adminAuth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    
    // Phân tách categories gốc và subcategories
    const parentCategories = categories.filter(c => !c.parentId);
    const subcategoriesMap = {};
    
    categories.forEach(cat => {
      if (cat.parentId) {
        const parentId = cat.parentId.toString();
        if (!subcategoriesMap[parentId]) {
          subcategoriesMap[parentId] = [];
        }
        subcategoriesMap[parentId].push(cat);
      }
    });
    
    // Gắn subcategories vào mỗi category gốc
    const result = parentCategories.map(cat => {
      const catObj = cat.toObject();
      catObj.subcategories = subcategoriesMap[cat._id.toString()] || [];
      return catObj;
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get category by ID
router.get('/categories/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create category
router.post('/categories', adminAuth, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update category
router.put('/categories/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete category (and its subcategories)
router.delete('/categories/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }
    
    // Xóa các subcategories của category này
    await Category.deleteMany({ parentId: req.params.id });
    
    // Xóa category
    await Category.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Đã xóa danh mục và các danh mục con' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ==================== GAME ACCOUNTS ====================

// Get all accounts (admin)
router.get('/accounts', adminAuth, async (req, res) => {
  try {
    const { category, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category) query.categoryId = category;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const accounts = await GameAccount.find(query)
      .populate('categoryId', 'name')
      .populate('soldTo', 'fullName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Decrypt credentials for display
    const accountsWithDecrypted = accounts.map(acc => {
      const accObj = acc.toObject();
      accObj.username = decrypt(accObj.username);
      accObj.password = decrypt(accObj.password);
      // Create loginInfo for frontend compatibility
      accObj.loginInfo = `Username: ${accObj.username}\nPassword: ${accObj.password}`;
      // Map categoryId to category for frontend compatibility
      accObj.category = accObj.categoryId;
      // Add thumbnail (first image)
      accObj.thumbnail = accObj.images?.[0] || null;
      return accObj;
    });

    const total = await GameAccount.countDocuments(query);

    res.json({
      accounts: accountsWithDecrypted,
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

// Create account
router.post('/accounts', adminAuth, async (req, res) => {
  try {
    const { loginInfo, ...restData } = req.body;
    
    // Parse loginInfo to extract username and password
    let username = '';
    let password = '';
    
    if (loginInfo) {
      const lines = loginInfo.split('\n');
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('username:') || lowerLine.includes('user:')) {
          const match = line.match(/(?:username|user)[:\s]*([^\n|]+)/i);
          if (match) username = match[1].trim();
        }
        if (lowerLine.includes('password:') || lowerLine.includes('pass:')) {
          const match = line.match(/(?:password|pass)[:\s]*([^\n|]+)/i);
          if (match) password = match[1].trim();
        }
      });
      
      // If still empty, try to get from line format "user:pass"
      if (!username || !password) {
        const simpleFormat = loginInfo.match(/^([^\n:]+):([^\n]+)$/);
        if (simpleFormat) {
          username = username || simpleFormat[1];
          password = password || simpleFormat[2];
        }
      }
    }
    
    const accountData = {
      ...restData,
      categoryId: restData.category || restData.categoryId, // Map category to categoryId
      username: username || 'N/A',
      password: password || 'N/A'
    };
    delete accountData.category; // Remove category if exists

    const account = new GameAccount(accountData);
    await account.save();

    // Populate category for response
    await account.populate('categoryId', 'name');

    // Build response with category for frontend compatibility
    const accountObj = account.toObject();
    accountObj.category = accountObj.categoryId;

    res.status(201).json(accountObj);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update account
router.put('/accounts/:id', adminAuth, async (req, res) => {
  try {
    const { loginInfo, ...restData } = req.body;
    
    const updateData = { ...restData };
    
    // Parse loginInfo to extract username and password if provided
    if (loginInfo) {
      let username = '';
      let password = '';
      
      const lines = loginInfo.split('\n');
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('username:') || lowerLine.includes('user:')) {
          const match = line.match(/(?:username|user)[:\s]*([^\n|]+)/i);
          if (match) username = match[1].trim();
        }
        if (lowerLine.includes('password:') || lowerLine.includes('pass:')) {
          const match = line.match(/(?:password|pass)[:\s]*([^\n|]+)/i);
          if (match) password = match[1].trim();
        }
      });
      
      if (username) updateData.username = username;
      if (password) updateData.password = password;
    }
    
    // Map category to categoryId for database compatibility
    if (updateData.category) {
      updateData.categoryId = updateData.category;
      delete updateData.category;
    }

    const account = await GameAccount.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('categoryId', 'name');

    // Build response with category for frontend compatibility
    const accountObj = account ? account.toObject() : null;
    if (accountObj) accountObj.category = accountObj.categoryId;

    res.json(accountObj);
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get single account by ID (admin) - with decrypted credentials
router.get('/accounts/:id', adminAuth, async (req, res) => {
  try {
    const account = await GameAccount.findById(req.params.id)
      .populate('categoryId', 'name');

    if (!account) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    const accountObj = account.toObject();

    // Decrypt credentials
    accountObj.username = decrypt(accountObj.username);
    accountObj.password = decrypt(accountObj.password);

    // Create loginInfo for frontend
    accountObj.loginInfo = `Username: ${accountObj.username}\nPassword: ${accountObj.password}`;

    // Map categoryId to category for frontend compatibility
    accountObj.category = accountObj.categoryId;

    res.json(accountObj);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete account
router.delete('/accounts/:id', adminAuth, async (req, res) => {
  try {
    await GameAccount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa tài khoản' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Toggle hot status
router.put('/accounts/:id/toggle-hot', adminAuth, async (req, res) => {
  try {
    const account = await GameAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }
    account.isHot = !account.isHot;
    await account.save();
    res.json({ message: account.isHot ? 'Đã đánh dấu Hot' : 'Đã bỏ đánh dấu Hot', account });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ==================== ORDERS ====================

// Get all orders (admin)
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('userId', 'fullName username')
      .populate({
        path: 'items.accountId',
        populate: { path: 'categoryId', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ==================== DEPOSITS ====================

// Get all deposit requests
router.get('/deposits', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const deposits = await DepositRequest.find(query)
      .populate('userId', 'fullName username')
      .populate('bankAccountId', 'bankName accountNumber identifier')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DepositRequest.countDocuments(query);

    res.json({
      deposits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Approve deposit
router.put('/deposits/:id/approve', adminAuth, async (req, res) => {
  try {
    const deposit = await DepositRequest.findById(req.params.id);
    
    if (!deposit) {
      return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Yêu cầu đã được xử lý' });
    }

    // Update deposit
    deposit.status = 'approved';
    deposit.processedAt = new Date();
    deposit.processedBy = req.user._id;
    await deposit.save();

    // Update user balance
    const user = await User.findById(deposit.userId);
    user.balance += deposit.amount;
    await user.save();

    res.json({ 
      message: 'Đã duyệt yêu cầu nạp tiền',
      deposit 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Reject deposit
router.put('/deposits/:id/reject', adminAuth, async (req, res) => {
  try {
    const { adminNote } = req.body;
    
    const deposit = await DepositRequest.findById(req.params.id);
    
    if (!deposit) {
      return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Yêu cầu đã được xử lý' });
    }

    deposit.status = 'rejected';
    deposit.adminNote = adminNote || 'Không hợp lệ';
    deposit.processedAt = new Date();
    deposit.processedBy = req.user._id;
    await deposit.save();

    res.json({ 
      message: 'Đã từ chối yêu cầu nạp tiền',
      deposit 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ==================== BANK ACCOUNTS ====================

// Get all bank accounts
router.get('/bank-accounts', adminAuth, async (req, res) => {
  try {
    const bankAccounts = await BankAccount.find().sort({ order: 1 });
    res.json(bankAccounts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create bank account
router.post('/bank-accounts', adminAuth, async (req, res) => {
  try {
    const bankAccount = new BankAccount(req.body);
    await bankAccount.save();
    res.status(201).json(bankAccount);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update bank account
router.put('/bank-accounts/:id', adminAuth, async (req, res) => {
  try {
    const bankAccount = await BankAccount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(bankAccount);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete bank account
router.delete('/bank-accounts/:id', adminAuth, async (req, res) => {
  try {
    await BankAccount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa tài khoản ngân hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Toggle bank account
router.put('/bank-accounts/:id/toggle', adminAuth, async (req, res) => {
  try {
    const bankAccount = await BankAccount.findById(req.params.id);
    bankAccount.isActive = !bankAccount.isActive;
    await bankAccount.save();
    res.json(bankAccount);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ==================== USERS ====================

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({ role: 'user' });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Toggle user status
router.put('/users/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: 'Đã cập nhật trạng thái', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Adjust user balance
router.put('/users/:id/adjust-balance', adminAuth, async (req, res) => {
  try {
    const { amount, action } = req.body; // action: 'add' or 'subtract'
    
    const user = await User.findById(req.params.id);
    
    if (action === 'add') {
      user.balance += amount;
    } else if (action === 'subtract') {
      user.balance = Math.max(0, user.balance - amount);
    }
    
    await user.save();
    res.json({ message: 'Đã điều chỉnh số dư', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ==================== SLIDERS ====================

// Get all sliders
router.get('/sliders', adminAuth, async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1 });
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create slider
router.post('/sliders', adminAuth, async (req, res) => {
  try {
    const slider = new Slider(req.body);
    await slider.save();
    res.status(201).json(slider);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update slider
router.put('/sliders/:id', adminAuth, async (req, res) => {
  try {
    const slider = await Slider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(slider);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete slider
router.delete('/sliders/:id', adminAuth, async (req, res) => {
  try {
    await Slider.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa slider' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ==================== NOTIFICATIONS ====================

// Get all notifications
router.get('/notifications', adminAuth, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ order: 1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create notification
router.post('/notifications', adminAuth, async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update notification
router.put('/notifications/:id', adminAuth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete notification
router.delete('/notifications/:id', adminAuth, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa thông báo' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ==================== SITE SETTINGS ====================

// Get all settings
router.get('/settings', adminAuth, async (req, res) => {
  try {
    const settings = await SiteSetting.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get logo settings
router.get('/settings/logo', adminAuth, async (req, res) => {
  try {
    const logoHeader = await SiteSetting.findOne({ key: 'logo_header' });
    const logoFooter = await SiteSetting.findOne({ key: 'logo_footer' });
    
    res.json({
      logoHeader: logoHeader?.value || null,
      logoFooter: logoFooter?.value || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update logo
router.put('/settings/logo', adminAuth, async (req, res) => {
  try {
    const { logoHeader, logoFooter } = req.body;

    if (logoHeader !== undefined) {
      await SiteSetting.findOneAndUpdate(
        { key: 'logo_header' },
        { 
          key: 'logo_header',
          value: logoHeader,
          type: 'image',
          description: 'Logo hiển thị trên header'
        },
        { upsert: true, new: true }
      );
    }

    if (logoFooter !== undefined) {
      await SiteSetting.findOneAndUpdate(
        { key: 'logo_footer' },
        { 
          key: 'logo_footer',
          value: logoFooter,
          type: 'image',
          description: 'Logo hiển thị trên footer'
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Đã cập nhật logo' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update single logo
router.put('/logo', adminAuth, async (req, res) => {
  try {
    const { logo } = req.body;

    if (!logo) {
      return res.status(400).json({ message: 'Logo URL is required' });
    }

    await SiteSetting.findOneAndUpdate(
      { key: 'logo' },
      { key: 'logo', value: logo, type: 'image' },
      { upsert: true, new: true }
    );

    res.json({ message: 'Đã cập nhật logo', logo });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Bulk upsert settings (PUT /api/admin/settings) — accepts an object of { key: value }
router.put('/settings', adminAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const entries = Object.entries(body).filter(([, v]) => v !== undefined && v !== null);

    if (entries.length === 0) {
      return res.json({ message: 'Không có dữ liệu để cập nhật', settings: [] });
    }

    const results = [];
    for (const [key, value] of entries) {
      const setting = await SiteSetting.findOneAndUpdate(
        { key },
        {
          key,
          value: typeof value === 'object' ? value : String(value),
          type: typeof value === 'object' ? 'object' : 'text',
          updatedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(setting);
    }

    res.json({ message: 'Đã cập nhật cài đặt', settings: results });
  } catch (error) {
    console.error('Bulk update settings error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update or create setting
router.put('/settings/:key', adminAuth, async (req, res) => {
  try {
    const { value, type, description } = req.body;
    
    const setting = await SiteSetting.findOneAndUpdate(
      { key: req.params.key },
      { 
        key: req.params.key,
        value,
        type: type || 'text',
        description: description || ''
      },
      { upsert: true, new: true }
    );

    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
