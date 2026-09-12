import mongoose from 'mongoose';

const depositRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  depositMethod: {
    type: String,
    enum: ['bank', 'card'],
    default: 'bank'
  },
  // Bank deposit fields
  bankAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    required: function() { return this.depositMethod === 'bank'; }
  },
  transferNote: {
    type: String,
    default: ''
  },
  // Card deposit fields
  cardType: {
    type: String,
    enum: ['viettel', 'mobifone', 'vinaphone'],
    required: function() { return this.depositMethod === 'card'; }
  },
  cardSerial: {
    type: String,
    required: function() { return this.depositMethod === 'card'; }
  },
  cardCode: {
    type: String,
    required: function() { return this.depositMethod === 'card'; }
  },
  // Common fields
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    default: ''
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('DepositRequest', depositRequestSchema);
