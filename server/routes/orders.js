import express from 'express';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import GameAccount from '../models/GameAccount.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { decrypt } from '../utils/encryption.js';

const router = express.Router();

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

// Checkout
router.post('/checkout', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Check if all items are available
    const unavailableItems = cart.items.filter(item => item.status !== 'available');
    if (unavailableItems.length > 0) {
      return res.status(400).json({ message: 'Một số tài khoản không còn khả dụng' });
    }

    // Calculate total
    const totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);

    // Check user balance
    const user = await User.findById(req.user._id);
    if (user.balance < totalAmount) {
      return res.status(400).json({ 
        message: `Số dư không đủ. Bạn cần ${totalAmount.toLocaleString('vi-VN')}đ, hiện có ${user.balance.toLocaleString('vi-VN')}đ`
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
      status: 'completed'
    });

    await order.save();

    // Update user balance
    user.balance -= totalAmount;
    user.purchaseHistory.push(order._id);
    await user.save();

    // Update game accounts status
    for (const item of cart.items) {
      item.status = 'sold';
      item.soldTo = req.user._id;
      item.soldAt = new Date();
      await item.save();
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate order for response
    await order.populate({
      path: 'items.accountId',
      populate: { path: 'categoryId' }
    });

    res.json({ 
      message: 'Thanh toán thành công!',
      order
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
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
