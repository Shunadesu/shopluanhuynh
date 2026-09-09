import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null  // null = danh mục gốc, có giá trị = danh mục con
  }
}, {
  timestamps: true
});

export default mongoose.model('Category', categorySchema);
