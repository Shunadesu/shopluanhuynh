import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'boolean', 'json', 'image'],
    default: 'text'
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('SiteSetting', siteSettingSchema);
