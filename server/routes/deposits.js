import express from 'express';
import DepositRequest from '../models/DepositRequest.js';
import BankAccount from '../models/BankAccount.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get active bank accounts
router.get('/bank-accounts', async (req, res) => {
  try {
    const bankAccounts = await BankAccount.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v');

    res.json(bankAccounts);
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create deposit request
router.post('/request', auth, async (req, res) => {
  try {
    const { amount, bankAccountId, transferNote } = req.body;

    if (!amount || amount < 10000) {
      return res.status(400).json({ message: 'Số tiền nạp tối thiểu là 10,000đ' });
    }

    // Check if bank account exists
    const bankAccount = await BankAccount.findById(bankAccountId);
    if (!bankAccount) {
      return res.status(404).json({ message: 'Tài khoản ngân hàng không tồn tại' });
    }

    const depositRequest = new DepositRequest({
      userId: req.user._id,
      amount,
      bankAccountId,
      transferNote: transferNote || `NAP${Date.now()}`
    });

    await depositRequest.save();

    res.status(201).json({
      message: 'Yêu cầu nạp tiền đã được gửi. Vui lòng chuyển khoản và chờ admin duyệt.',
      deposit: depositRequest
    });
  } catch (error) {
    console.error('Create deposit request error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get my deposit requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const deposits = await DepositRequest.find({ userId: req.user._id })
      .populate('bankAccountId', 'bankName accountNumber')
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (error) {
    console.error('Get my deposits error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
