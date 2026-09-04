import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin routes
router.get('/admin/all', protect, admin, getAllCategories);
router.post('/admin/create', protect, admin, createCategory);
router.put('/admin/:id', protect, admin, updateCategory);
router.delete('/admin/:id', protect, admin, deleteCategory);

export default router;
