import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  accountName: {
    type: String,
    required: true,
    trim: true
  },
  qrCodeImage: {
    type: String,
    required: true
  },
  identifier: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

export default BankAccount;
