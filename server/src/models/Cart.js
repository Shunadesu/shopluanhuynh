import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guestId: {
    type: String,
    default: null
  },
  items: [{
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameAccount',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Ensure either user or guestId is set
cartSchema.pre('validate', function(next) {
  if (!this.user && !this.guestId) {
    next(new Error('Either user or guestId must be set'));
  } else {
    next();
  }
});

// Compound index for user and guestId
cartSchema.index({ user: 1 });
cartSchema.index({ guestId: 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
