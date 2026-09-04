import mongoose from 'mongoose';

const gameAccountSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
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
  rank: {
    type: String,
    default: ''
  },
  server: {
    type: String,
    default: ''
  },
  additionalInfo: {
    type: String,
    default: ''
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
