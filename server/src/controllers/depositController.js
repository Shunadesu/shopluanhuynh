import DepositRequest from '../models/DepositRequest.js';
import BankAccount from '../models/BankAccount.js';
import User from '../models/User.js';

// @desc    Get active bank accounts
// @route   GET /api/deposits/bank-accounts
// @access  Public
export const getBankAccounts = async (req, res) => {
  try {
    const bankAccounts = await BankAccount.find({ isActive: true }).sort({ order: 1 });
    
    // Random shuffle for display
    const shuffled = bankAccounts.sort(() => 0.5 - Math.random());
    
    res.json(shuffled);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create deposit request
// @route   POST /api/deposits/request
// @access  Private
export const createDepositRequest = async (req, res) => {
  try {
    const { amount, bankAccountId, transferCode, transferNote } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const depositRequest = await DepositRequest.create({
      user: req.user._id,
      amount,
      bankAccount: bankAccountId,
      transferCode,
      transferNote,
      status: 'pending'
    });

    const populatedRequest = await DepositRequest.findById(depositRequest._id)
      .populate('user', 'email fullName')
      .populate('bankAccount');

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user deposit requests
// @route   GET /api/deposits/my-requests
// @access  Private
export const getMyDepositRequests = async (req, res) => {
  try {
    const requests = await DepositRequest.find({ user: req.user._id })
      .populate('bankAccount')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all deposit requests (admin)
// @route   GET /api/admin/deposits
// @access  Private/Admin
export const getAllDepositRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const requests = await DepositRequest.find(query)
      .populate('user', 'email fullName phone')
      .populate('bankAccount')
      .populate('processedBy', 'email fullName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await DepositRequest.countDocuments(query);

    res.json({
      requests,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve deposit request
// @route   PUT /api/admin/deposits/:id/approve
// @access  Private/Admin
export const approveDeposit = async (req, res) => {
  try {
    const { adminNote } = req.body;

    const deposit = await DepositRequest.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({ message: 'Deposit request not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }

    // Update user balance
    const user = await User.findById(deposit.user);
    user.balance += deposit.amount;
    await user.save();

    // Update deposit status
    deposit.status = 'approved';
    deposit.adminNote = adminNote;
    deposit.processedBy = req.user._id;
    deposit.processedAt = new Date();
    await deposit.save();

    const populatedDeposit = await DepositRequest.findById(deposit._id)
      .populate('user', 'email fullName balance')
      .populate('bankAccount')
      .populate('processedBy', 'email fullName');

    res.json(populatedDeposit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject deposit request
// @route   PUT /api/admin/deposits/:id/reject
// @access  Private/Admin
export const rejectDeposit = async (req, res) => {
  try {
    const { adminNote } = req.body;

    const deposit = await DepositRequest.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({ message: 'Deposit request not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }

    deposit.status = 'rejected';
    deposit.adminNote = adminNote || 'Rejected by admin';
    deposit.processedBy = req.user._id;
    deposit.processedAt = new Date();
    await deposit.save();

    const populatedDeposit = await DepositRequest.findById(deposit._id)
      .populate('user', 'email fullName')
      .populate('bankAccount')
      .populate('processedBy', 'email fullName');

    res.json(populatedDeposit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bank accounts (admin)
// @route   GET /api/admin/bank-accounts
// @access  Private/Admin
export const getAllBankAccounts = async (req, res) => {
  try {
    const bankAccounts = await BankAccount.find().sort({ order: 1 });
    res.json(bankAccounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create bank account
// @route   POST /api/admin/bank-accounts
// @access  Private/Admin
export const createBankAccount = async (req, res) => {
  try {
    const { bankName, accountNumber, accountName, qrCodeImage, identifier, isActive, order } = req.body;

    const bankAccount = await BankAccount.create({
      bankName,
      accountNumber,
      accountName,
      qrCodeImage,
      identifier,
      isActive,
      order
    });

    res.status(201).json(bankAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update bank account
// @route   PUT /api/admin/bank-accounts/:id
// @access  Private/Admin
export const updateBankAccount = async (req, res) => {
  try {
    const bankAccount = await BankAccount.findById(req.params.id);

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    const { bankName, accountNumber, accountName, qrCodeImage, identifier, isActive, order } = req.body;

    bankAccount.bankName = bankName || bankAccount.bankName;
    bankAccount.accountNumber = accountNumber || bankAccount.accountNumber;
    bankAccount.accountName = accountName || bankAccount.accountName;
    bankAccount.qrCodeImage = qrCodeImage || bankAccount.qrCodeImage;
    bankAccount.identifier = identifier || bankAccount.identifier;
    bankAccount.isActive = isActive !== undefined ? isActive : bankAccount.isActive;
    bankAccount.order = order !== undefined ? order : bankAccount.order;

    const updatedBankAccount = await bankAccount.save();
    res.json(updatedBankAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete bank account
// @route   DELETE /api/admin/bank-accounts/:id
// @access  Private/Admin
export const deleteBankAccount = async (req, res) => {
  try {
    const bankAccount = await BankAccount.findById(req.params.id);

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    await bankAccount.deleteOne();
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle bank account status
// @route   PUT /api/admin/bank-accounts/:id/toggle
// @access  Private/Admin
export const toggleBankAccount = async (req, res) => {
  try {
    const bankAccount = await BankAccount.findById(req.params.id);

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    bankAccount.isActive = !bankAccount.isActive;
    await bankAccount.save();

    res.json(bankAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top depositors of the month
// @route   GET /api/deposits/top-depositors
// @access  Public
export const getTopDepositors = async (req, res) => {
  try {
    // Get start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Aggregate approved deposits by user
    const topDepositors = await DepositRequest.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: '$user',
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
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
          totalAmount: 1,
          fullName: '$user.fullName'
        }
      }
    ]);

    res.json(topDepositors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
