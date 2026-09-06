import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    enum: ['facebook', 'zalo', 'youtube', 'tiktok', 'website', 'other'],
    default: 'other'
  },
  icon: {
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
  }
}, {
  timestamps: true
});

// Index for efficient queries
socialLinkSchema.index({ isActive: 1, order: 1 });

const SocialLink = mongoose.model('SocialLink', socialLinkSchema);

export default SocialLink;
