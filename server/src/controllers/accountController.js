import GameAccount from '../models/GameAccount.js';
import Category from '../models/Category.js';

// @desc    Get all accounts with filters
// @route   GET /api/accounts
// @access  Public
export const getAccounts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, status, search, page = 1, limit = 12 } = req.query;

    let query = { status: 'available' };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        query.category = cat._id;
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const accounts = await GameAccount.find(query)
      .populate('category', 'name slug')
      .select('-username -password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await GameAccount.countDocuments(query);

    res.json({
      accounts,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get account by ID
// @route   GET /api/accounts/:id
// @access  Public
export const getAccountById = async (req, res) => {
  try {
    const account = await GameAccount.findById(req.params.id)
      .populate('category', 'name slug')
      .select('-username -password');

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all accounts (admin)
// @route   GET /api/admin/accounts
// @access  Private/Admin
export const getAllAccounts = async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const accounts = await GameAccount.find(query)
      .populate('category', 'name slug')
      .populate('soldTo', 'email fullName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await GameAccount.countDocuments(query);

    res.json({
      accounts,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create account
// @route   POST /api/admin/accounts
// @access  Private/Admin
export const createAccount = async (req, res) => {
  try {
    const {
      category,
      title,
      description,
      username,
      password,
      price,
      originalPrice,
      images,
      teamValue,
      bp,
      phone,
      email,
      cccd,
      additionalInfo
    } = req.body;

    const account = await GameAccount.create({
      category,
      title,
      description,
      username,
      password,
      price,
      originalPrice,
      images,
      teamValue,
      bp,
      phone,
      email,
      cccd,
      additionalInfo
    });

    const populatedAccount = await GameAccount.findById(account._id)
      .populate('category', 'name slug');

    res.status(201).json(populatedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk import accounts
// @route   POST /api/admin/accounts/bulk-import
// @access  Private/Admin
export const bulkImportAccounts = async (req, res) => {
  try {
    const { accounts } = req.body;

    if (!Array.isArray(accounts) || accounts.length === 0) {
      return res.status(400).json({ message: 'No accounts provided' });
    }

    const createdAccounts = await GameAccount.insertMany(accounts);

    res.status(201).json({
      message: `${createdAccounts.length} accounts imported successfully`,
      count: createdAccounts.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update account
// @route   PUT /api/admin/accounts/:id
// @access  Private/Admin
export const updateAccount = async (req, res) => {
  try {
    const account = await GameAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const {
      category,
      title,
      description,
      username,
      password,
      price,
      originalPrice,
      images,
      teamValue,
      bp,
      phone,
      email,
      cccd,
      additionalInfo,
      status
    } = req.body;

    account.category = category || account.category;
    account.title = title || account.title;
    account.description = description !== undefined ? description : account.description;
    if (username) account.username = username;
    if (password) account.password = password;
    account.price = price !== undefined ? price : account.price;
    account.originalPrice = originalPrice !== undefined ? originalPrice : account.originalPrice;
    account.images = images || account.images;
    account.teamValue = teamValue !== undefined ? teamValue : account.teamValue;
    account.bp = bp !== undefined ? bp : account.bp;
    account.phone = phone !== undefined ? phone : account.phone;
    account.email = email !== undefined ? email : account.email;
    account.cccd = cccd !== undefined ? cccd : account.cccd;
    account.additionalInfo = additionalInfo !== undefined ? additionalInfo : account.additionalInfo;
    account.status = status || account.status;

    const updatedAccount = await account.save();
    const populatedAccount = await GameAccount.findById(updatedAccount._id)
      .populate('category', 'name slug');

    res.json(populatedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete account
// @route   DELETE /api/admin/accounts/:id
// @access  Private/Admin
export const deleteAccount = async (req, res) => {
  try {
    const account = await GameAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (account.status === 'sold') {
      return res.status(400).json({ message: 'Cannot delete sold account' });
    }

    await account.deleteOne();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
