import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'boolean', 'json', 'html'],
    default: 'text'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema);

export default SiteSetting;
