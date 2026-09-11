import express from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import GameAccount from '../models/GameAccount.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { decrypt } from '../utils/encryption.js';
import { purchaseLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Buy now - Direct purchase without cart - WITH TRANSACTION + RATE LIMITING
router.post('/buy-now', auth, purchaseLimiter, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { accountId } = req.body;

    // Check if account exists and available with lock
    const account = await GameAccount.findOne({
      _id: accountId,
      status: 'available'
    }).session(session);

    if (!account) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Tài khoản không tồn tại hoặc đã được bán' });
    }

    // Check user balance
    const user = await User.findById(req.user._id).session(session);
    if (user.balance < account.price) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Số dư không đủ. Cần ${account.price.toLocaleString('vi-VN')}đ, hiện có ${user.balance.toLocaleString('vi-VN')}đ`,
        required: account.price,
        current: user.balance
      });
    }

    // Create order
    const orderNumber = 'ORD' + Date.now();
    const order = new Order({
      userId: req.user._id,
      orderNumber,
      items: [{
        accountId: account._id,
        price: account.price
      }],
      totalAmount: account.price,
      status: 'completed',
      paymentMethod: 'balance'
    });

    await order.save({ session });

    // Update user balance and purchase history
    const prevTotalSpent = user.totalSpent || 0;
    user.balance -= account.price;
    user.totalSpent = prevTotalSpent + account.price;
    user.purchaseHistory.push(order._id);

    // Spin thưởng CHỈ tính theo nạp tiền (không cộng khi mua hàng)
    order.spinsAwarded = 0;

    await order.save({ session });
    await user.save({ session });

    // Update game account status atomically
    account.status = 'sold';
    account.soldTo = req.user._id;
    account.soldAt = new Date();
    await account.save({ session });

    // Commit transaction
    await session.commitTransaction();

    res.json({
      message: 'Mua tài khoản thành công',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber
      },
      newBalance: user.balance,
      spinsAwarded: order.spinsAwarded
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Buy now error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  } finally {
    session.endSession();
  }
});

// Add to cart
router.post('/cart/add', auth, async (req, res) => {
  try {
    const { accountId } = req.body;

    // Check if account exists and available
    const account = await GameAccount.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    if (account.status !== 'available') {
      return res.status(400).json({ message: 'Tài khoản không còn khả dụng' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Check if already in cart
    if (cart.items.includes(accountId)) {
      return res.status(400).json({ message: 'Tài khoản đã có trong giỏ hàng' });
    }

    cart.items.push(accountId);
    await cart.save();

    res.json({ message: 'Đã thêm vào giỏ hàng', cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get cart
router.get('/cart', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate({
        path: 'items',
        populate: { path: 'categoryId', select: 'name' }
      });

    if (!cart) {
      return res.json({ items: [] });
    }

    // Filter out sold/unavailable items
    const availableItems = cart.items.filter(item => item && item.status === 'available');

    res.json({ items: availableItems });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Remove from cart
router.delete('/cart/:accountId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    cart.items = cart.items.filter(item => item.toString() !== req.params.accountId);
    await cart.save();

    res.json({ message: 'Đã xóa khỏi giỏ hàng' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Checkout - WITH TRANSACTION + RATE LIMITING
router.post('/checkout', auth, purchaseLimiter, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items')
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Check if all items are available
    const unavailableItems = cart.items.filter(item => item.status !== 'available');
    if (unavailableItems.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Một số tài khoản không còn khả dụng',
        unavailableItems: unavailableItems.map(i => i.title)
      });
    }

    // Calculate total
    const totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);

    // Check user balance
    const user = await User.findById(req.user._id).session(session);
    if (user.balance < totalAmount) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: `Số dư không đủ. Bạn cần ${totalAmount.toLocaleString('vi-VN')}đ, hiện có ${user.balance.toLocaleString('vi-VN')}đ`,
        required: totalAmount,
        current: user.balance
      });
    }

    // Create order
    const orderNumber = 'ORD' + Date.now();
    const orderItems = cart.items.map(item => ({
      accountId: item._id,
      price: item.price
    }));

    const order = new Order({
      userId: req.user._id,
      orderNumber,
      items: orderItems,
      totalAmount,
      status: 'completed',
      paymentMethod: 'balance'
    });

    await order.save({ session });

    // Update user balance and totalSpent
    const prevTotalSpent = user.totalSpent || 0;
    user.balance -= totalAmount;
    user.totalSpent = prevTotalSpent + totalAmount;
    user.purchaseHistory.push(order._id);

    // Spin thưởng CHỈ tính theo nạp tiền (không cộng khi mua hàng)
    order.spinsAwarded = 0;

    await order.save({ session });
    await user.save({ session });

    // Update game accounts status atomically
    for (const item of cart.items) {
      await GameAccount.findByIdAndUpdate(
        item._id,
        {
          $set: {
            status: 'sold',
            soldTo: req.user._id,
            soldAt: new Date()
          }
        },
        { session }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Populate order for response (outside transaction)
    await order.populate({
      path: 'items.accountId',
      populate: { path: 'categoryId' }
    });

    res.json({ 
      message: 'Thanh toán thành công!',
      order,
      newBalance: user.balance,
      spinsAwarded: order.spinsAwarded
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  } finally {
    session.endSession();
  }
});

// Get user orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate({
        path: 'items.accountId',
        populate: { path: 'categoryId', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get purchased accounts (completed orders with decrypted credentials)
router.get('/purchased-accounts', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
      status: 'completed'
    })
      .populate({
        path: 'items.accountId',
        populate: { path: 'categoryId', select: 'name' }
      })
      .sort({ createdAt: -1 });

    // Flatten items: each account is a row with order metadata + account object
    const purchasedAccounts = [];
    for (const order of orders) {
      for (const item of order.items) {
        if (!item.accountId) continue;
        const acc = item.accountId;
        purchasedAccounts.push({
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          orderDate: order.createdAt,
          price: item.price,
          account: {
            _id: acc._id,
            title: acc.title,
            images: acc.images || [],
            categoryId: acc.categoryId ? { name: acc.categoryId.name } : {},
            username: acc.username ? decrypt(acc.username) : '',
            password: acc.password ? decrypt(acc.password) : '',
            password2: acc.password2 ? decrypt(acc.password2) : '',
            bp: acc.bp || '',
            teamValue: acc.teamValue || '',
            additionalInfo: acc.additionalInfo || '',
          },
        });
      }
    }

    res.json(purchasedAccounts);
  } catch (error) {
    console.error('Get purchased accounts error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    }).populate({
      path: 'items.accountId',
      populate: { path: 'categoryId' }
    });

    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }

    // Decrypt account credentials for completed orders
    if (order.status === 'completed') {
      order.items = order.items.map(item => {
        if (item.accountId) {
          item.accountId.username = decrypt(item.accountId.username);
          item.accountId.password = decrypt(item.accountId.password);
          item.accountId.password2 = decrypt(item.accountId.password2);
        }
        return item;
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
