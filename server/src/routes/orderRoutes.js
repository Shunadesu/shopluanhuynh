import express from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  mergeCart,
  checkout,
  getUserOrders,
  getOrderById,
  getAllOrders,
  getPurchasedAccounts
} from '../controllers/orderController.js';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Cart routes (public with optional auth)
router.post('/cart/add', optionalAuth, addToCart);
router.get('/cart', optionalAuth, getCart);
router.delete('/cart/:accountId', optionalAuth, removeFromCart);
router.post('/cart/merge', protect, mergeCart);

// Order routes
router.post('/checkout', protect, checkout);
router.get('/purchased-accounts', protect, getPurchasedAccounts);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrderById);

// Admin routes
router.get('/admin/all', protect, admin, getAllOrders);

export default router;
