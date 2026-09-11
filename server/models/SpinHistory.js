import mongoose from 'mongoose';

const spinHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rewardType: {
    type: String,
    enum: ['cash', 'account', 'voucher', 'nothing'],
    required: true
  },
  rewardLabel: {
    type: String,
    required: true
  },
  // Cash reward
  rewardValue: {
    type: Number,
    default: 0
  },
  // Account reward
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameAccount',
    default: null
  },
  // Voucher reward
  voucherCode: {
    type: String,
    default: ''
  },
  voucherDiscount: {
    type: Number,
    default: 0
  },
  spinAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for user history queries
spinHistorySchema.index({ userId: 1, spinAt: -1 });

export default mongoose.model('SpinHistory', spinHistorySchema);
