import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String,
    trim: true
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

const Slider = mongoose.model('Slider', sliderSchema);

export default Slider;
