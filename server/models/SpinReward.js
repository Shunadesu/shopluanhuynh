import mongoose from 'mongoose';

const spinRewardSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  rewardType: {
    type: String,
    enum: ['cash', 'account', 'voucher', 'nothing'],
    required: true
  },
  // For cash rewards
  value: {
    type: Number,
    default: 0
  },
  // For account rewards
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameAccount',
    default: null
  },
  // For voucher rewards
  voucherCode: {
    type: String,
    default: ''
  },
  voucherDiscount: {
    type: Number,
    default: 0
  },
  // Probability (0-100)
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // Visual
  color: {
    type: String,
    default: '#FF6D00'
  },
  icon: {
    type: String,
    default: ''
  },
  // Stock management
  stock: {
    type: Number,
    default: null // null = unlimited
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for querying active rewards
spinRewardSchema.index({ isActive: 1 });

export default mongoose.model('SpinReward', spinRewardSchema);
