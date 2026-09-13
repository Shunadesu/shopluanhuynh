import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Áp dụng cho:
    applyType: {
      type: String,
      enum: ['accounts', 'categories', 'subcategories'],
      required: true,
    },
    // Danh sách ID áp dụng
    accountIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameAccount',
    }],
    categoryIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
    subcategoryIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
    }],
    // Thời gian áp dụng (optional)
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index cho performance
promotionSchema.index({ isActive: 1, applyType: 1 });
promotionSchema.index({ accountIds: 1 });
promotionSchema.index({ categoryIds: 1 });
promotionSchema.index({ subcategoryIds: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });

// Kiểm tra promotion có active không (xét cả date range)
promotionSchema.methods.isCurrentlyActive = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  
  // Nếu có startDate và chưa đến ngày bắt đầu
  if (this.startDate && now < this.startDate) return false;
  
  // Nếu có endDate và đã quá ngày kết thúc
  if (this.endDate && now > this.endDate) return false;
  
  return true;
};

// Virtual: số lượng items được áp dụng
promotionSchema.virtual('appliedCount').get(function() {
  if (this.applyType === 'accounts') return this.accountIds.length;
  if (this.applyType === 'categories') return this.categoryIds.length;
  if (this.applyType === 'subcategories') return this.subcategoryIds.length;
  return 0;
});

// Đảm bảo virtuals được include khi convert sang JSON
promotionSchema.set('toJSON', { virtuals: true });
promotionSchema.set('toObject', { virtuals: true });

const Promotion = mongoose.model('Promotion', promotionSchema);

export default Promotion;
