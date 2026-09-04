import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  qrCodeImage: {
    type: String,
    default: ''
  },
  identifier: {
    type: String,
    required: true,
    unique: true
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

export default mongoose.model('BankAccount', bankAccountSchema);
