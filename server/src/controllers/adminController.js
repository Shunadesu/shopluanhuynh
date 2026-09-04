import User from '../models/User.js';
import Order from '../models/Order.js';
import GameAccount from '../models/GameAccount.js';
import DepositRequest from '../models/DepositRequest.js';
import Category from '../models/Category.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Total revenue
    const completedOrders = await Order.find({ status: 'completed' });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({ 
      status: 'completed',
      createdAt: { $gte: today }
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Total orders
    const totalOrders = await Order.countDocuments();
    const todayOrdersCount = todayOrders.length;

    // Total users
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });

    // Available accounts
    const availableAccounts = await GameAccount.countDocuments({ status: 'available' });
    const soldAccounts = await GameAccount.countDocuments({ status: 'sold' });

    // Pending deposits
    const pendingDeposits = await DepositRequest.countDocuments({ status: 'pending' });

    res.json({
      revenue: {
        total: totalRevenue,
        today: todayRevenue
      },
      orders: {
        total: totalOrders,
        today: todayOrdersCount,
        pending: await Order.countDocuments({ status: 'pending' })
      },
      users: {
        total: totalUsers,
        active: activeUsers
      },
      accounts: {
        available: availableAccounts,
        sold: soldAccounts,
        total: availableAccounts + soldAccounts
      },
      deposits: {
        pending: pendingDeposits
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get revenue chart data
// @route   GET /api/admin/dashboard/revenue-chart
// @access  Private/Admin
export const getRevenueChart = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysCount = Number(days);

    const data = [];
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const orders = await Order.find({
        status: 'completed',
        createdAt: { $gte: date, $lt: nextDate }
      });

      const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      data.push({
        date: date.toISOString().split('T')[0],
        revenue,
        orders: orders.length
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top categories
// @route   GET /api/admin/dashboard/top-categories
// @access  Private/Admin
export const getTopCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const soldCount = await GameAccount.countDocuments({
          category: category._id,
          status: 'sold'
        });

        const orders = await Order.find({
          'items.category': category._id,
          status: 'completed'
        });

        const revenue = orders.reduce((sum, order) => {
          const categoryItems = order.items.filter(
            item => item.category.toString() === category._id.toString()
          );
          return sum + categoryItems.reduce((itemSum, item) => itemSum + item.price, 0);
        }, 0);

        return {
          name: category.name,
          soldCount,
          revenue
        };
      })
    );

    // Sort by revenue
    categoryStats.sort((a, b) => b.revenue - a.revenue);

    // Return top 5
    res.json(categoryStats.slice(0, 5));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent orders
// @route   GET /api/admin/dashboard/recent-orders
// @access  Private/Admin
export const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email fullName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    let query = { role: 'user' };

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('purchaseHistory.orderId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's orders
    const orders = await Order.find({ user: user._id })
      .populate('items.account')
      .sort({ createdAt: -1 });

    // Get user's deposits
    const deposits = await DepositRequest.find({ user: user._id })
      .populate('bankAccount')
      .sort({ createdAt: -1 });

    res.json({
      user,
      orders,
      deposits
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Adjust user balance
// @route   PUT /api/admin/users/:id/adjust-balance
// @access  Private/Admin
export const adjustUserBalance = async (req, res) => {
  try {
    const { amount, action } = req.body; // action: 'add' or 'subtract'

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (action === 'add') {
      user.balance += Number(amount);
    } else if (action === 'subtract') {
      if (user.balance < Number(amount)) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      user.balance -= Number(amount);
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await user.save();

    res.json({
      message: 'Balance adjusted successfully',
      user: {
        _id: user._id,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
