import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  link: {
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
  displayMode: {
    type: String,
    enum: ['slider', 'stack'],
    default: 'stack'
  }
}, {
  timestamps: true
});

export default mongoose.model('Slider', sliderSchema);
