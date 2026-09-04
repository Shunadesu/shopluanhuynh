import express from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  checkout,
  getUserOrders,
  getOrderById,
  getAllOrders
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Cart routes
router.post('/cart/add', protect, addToCart);
router.get('/cart', protect, getCart);
router.delete('/cart/:accountId', protect, removeFromCart);

// Order routes
router.post('/checkout', protect, checkout);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrderById);

// Admin routes
router.get('/admin/all', protect, admin, getAllOrders);

export default router;
