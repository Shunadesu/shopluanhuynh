import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['top_deposit', 'system', 'promotion'],
    default: 'system'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  dismissDuration: {
    type: Number,
    default: 24
  }
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);
