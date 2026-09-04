import express from 'express';
import {
  getDashboardStats,
  getRevenueChart,
  getTopCategories,
  getRecentOrders,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  adjustUserBalance
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dashboard routes
router.get('/dashboard/stats', protect, admin, getDashboardStats);
router.get('/dashboard/revenue-chart', protect, admin, getRevenueChart);
router.get('/dashboard/top-categories', protect, admin, getTopCategories);
router.get('/dashboard/recent-orders', protect, admin, getRecentOrders);

// User management routes
router.get('/users', protect, admin, getAllUsers);
router.get('/users/:id', protect, admin, getUserById);
router.put('/users/:id/toggle-status', protect, admin, toggleUserStatus);
router.put('/users/:id/adjust-balance', protect, admin, adjustUserBalance);

export default router;
