import express from 'express';
import {
  getBankAccounts,
  createDepositRequest,
  getMyDepositRequests,
  getAllDepositRequests,
  approveDeposit,
  rejectDeposit,
  getAllBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  toggleBankAccount,
  getTopDepositors
} from '../controllers/depositController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/User routes
router.get('/bank-accounts', getBankAccounts);
router.get('/top-depositors', getTopDepositors);
router.post('/request', protect, createDepositRequest);
router.get('/my-requests', protect, getMyDepositRequests);

// Admin deposit management
router.get('/admin/all', protect, admin, getAllDepositRequests);
router.put('/admin/:id/approve', protect, admin, approveDeposit);
router.put('/admin/:id/reject', protect, admin, rejectDeposit);

// Admin bank account management
router.get('/admin/bank-accounts', protect, admin, getAllBankAccounts);
router.post('/admin/bank-accounts', protect, admin, createBankAccount);
router.put('/admin/bank-accounts/:id', protect, admin, updateBankAccount);
router.delete('/admin/bank-accounts/:id', protect, admin, deleteBankAccount);
router.put('/admin/bank-accounts/:id/toggle', protect, admin, toggleBankAccount);

export default router;
