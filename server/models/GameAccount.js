import mongoose from 'mongoose';

const gameAccountSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  code: {
    type: String,
    unique: true,
    sparse: true,
    default: function() {
      return 'ACC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase();
    }
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }],
  teamValue: {
    type: String,
    default: ''
  },
  bp: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  cccd: {
    type: String,
    default: ''
  },
  additionalInfo: {
    type: String,
    default: ''
  },
  isHot: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  soldAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('GameAccount', gameAccountSchema);
