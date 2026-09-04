import Cart from '../models/Cart.js';
import GameAccount from '../models/GameAccount.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { accountId } = req.body;

    // Check if account exists and is available
    const account = await GameAccount.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (account.status !== 'available') {
      return res.status(400).json({ message: 'Account is not available' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ account: accountId }]
      });
    } else {
      // Check if item already in cart
      const itemExists = cart.items.some(item => item.account.toString() === accountId);
      
      if (itemExists) {
        return res.status(400).json({ message: 'Account already in cart' });
      }

      cart.items.push({ account: accountId });
      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.account',
        select: '-username -password',
        populate: { path: 'category', select: 'name slug' }
      });

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.account',
        select: '-username -password',
        populate: { path: 'category', select: 'name slug' }
      });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out sold/unavailable accounts
    const validItems = cart.items.filter(item => 
      item.account && item.account.status === 'available'
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:accountId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.account.toString() !== req.params.accountId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.account',
        select: '-username -password',
        populate: { path: 'category', select: 'name slug' }
      });

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Checkout
// @route   POST /api/orders/checkout
// @access  Private
export const checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.account');

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Verify all accounts are available
    for (const item of cart.items) {
      if (!item.account || item.account.status !== 'available') {
        await session.abortTransaction();
        return res.status(400).json({ 
          message: `Account "${item.account?.title}" is no longer available` 
        });
      }
    }

    // Calculate total
    const totalAmount = cart.items.reduce((sum, item) => sum + item.account.price, 0);

    // Check user balance
    const user = await User.findById(req.user._id).session(session);
    if (user.balance < totalAmount) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Insufficient balance',
        required: totalAmount,
        current: user.balance
      });
    }

    // Deduct balance
    user.balance -= totalAmount;
    await user.save({ session });

    // Create order items
    const orderItems = cart.items.map(item => ({
      account: item.account._id,
      price: item.account.price,
      title: item.account.title,
      category: item.account.category
    }));

    // Create order
    const order = await Order.create([{
      user: req.user._id,
      items: orderItems,
      totalAmount,
      status: 'completed'
    }], { session });

    // Update accounts status
    for (const item of cart.items) {
      await GameAccount.findByIdAndUpdate(
        item.account._id,
        {
          status: 'sold',
          soldTo: req.user._id,
          soldAt: new Date()
        },
        { session }
      );
    }

    // Update user purchase history
    user.purchaseHistory.push({
      orderId: order[0]._id,
      purchasedAt: new Date()
    });
    await user.save({ session });

    // Clear cart
    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();

    // Populate order for response
    const populatedOrder = await Order.findById(order[0]._id)
      .populate({
        path: 'items.account',
        populate: { path: 'category', select: 'name slug' }
      });

    res.status(201).json(populatedOrder);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'items.account',
        populate: { path: 'category', select: 'name slug' }
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID with decrypted credentials
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items.account',
        populate: { path: 'category', select: 'name slug' }
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Decrypt credentials for purchased accounts
    const orderData = order.toObject();
    orderData.items = await Promise.all(
      orderData.items.map(async (item) => {
        if (item.account) {
          const fullAccount = await GameAccount.findById(item.account._id);
          if (fullAccount) {
            const credentials = fullAccount.decryptCredentials();
            item.account.username = credentials.username;
            item.account.password = credentials.password;
          }
        }
        return item;
      })
    );

    res.json(orderData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'email fullName')
      .populate({
        path: 'items.account',
        populate: { path: 'category', select: 'name slug' }
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
