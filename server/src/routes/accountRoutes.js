import express from 'express';
import {
  getAccounts,
  getAccountById,
  getAllAccounts,
  createAccount,
  bulkImportAccounts,
  updateAccount,
  deleteAccount
} from '../controllers/accountController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAccounts);
router.get('/:id', getAccountById);

// Admin routes
router.get('/admin/all', protect, admin, getAllAccounts);
router.post('/admin/create', protect, admin, createAccount);
router.post('/admin/bulk-import', protect, admin, bulkImportAccounts);
router.put('/admin/:id', protect, admin, updateAccount);
router.delete('/admin/:id', protect, admin, deleteAccount);

export default router;
