import express from 'express';
import Promotion from '../models/Promotion.js';
import GameAccount from '../models/GameAccount.js';
import Category from '../models/Category.js';
import { clearPromotionCache } from '../utils/priceCalculator.js';

const router = express.Router();

// GET /admin/promotions - Danh sách promotions
router.get('/', async (req, res) => {
  try {
    const { status, applyType, search } = req.query;

    const filter = {};

    // Filter by status
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    // Filter by applyType
    if (applyType && ['accounts', 'categories', 'subcategories'].includes(applyType)) {
      filter.applyType = applyType;
    }

    // Search by name
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const promotions = await Promotion.find(filter)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate applied count for each promotion
    const promotionsWithCount = await Promise.all(
      promotions.map(async (promo) => {
        let appliedCount = 0;

        if (promo.applyType === 'accounts') {
          appliedCount = promo.accountIds.length;
        } else if (promo.applyType === 'categories') {
          appliedCount = promo.categoryIds.length;
        } else if (promo.applyType === 'subcategories') {
          appliedCount = promo.subcategoryIds.length;
        }

        return {
          ...promo,
          appliedCount,
        };
      })
    );

    res.json(promotionsWithCount);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ message: 'Lỗi khi tải danh sách khuyến mãi' });
  }
});

// GET /admin/promotions/:id - Chi tiết promotion
router.get('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('accountIds', 'code title')
      .populate('categoryIds', 'name')
      .populate('subcategoryIds', 'name');

    if (!promotion) {
      return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }

    res.json(promotion);
  } catch (error) {
    console.error('Error fetching promotion:', error);
    res.status(500).json({ message: 'Lỗi khi tải thông tin khuyến mãi' });
  }
});

// POST /admin/promotions - Tạo promotion mới
router.post('/', async (req, res) => {
  try {
    const {
      name,
      discountPercent,
      isActive,
      applyType,
      accountIds,
      categoryIds,
      subcategoryIds,
      startDate,
      endDate,
    } = req.body;

    // Validation
    if (!name || !discountPercent || !applyType) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    if (discountPercent < 0 || discountPercent > 100) {
      return res.status(400).json({ message: '% giảm giá phải từ 0-100' });
    }

    if (!['accounts', 'categories', 'subcategories'].includes(applyType)) {
      return res.status(400).json({ message: 'Loại áp dụng không hợp lệ' });
    }

    // Check có chọn items không
    if (applyType === 'accounts' && (!accountIds || accountIds.length === 0)) {
      return res.status(400).json({ message: 'Vui lòng chọn ít nhất 1 tài khoản' });
    }
    if (applyType === 'categories' && (!categoryIds || categoryIds.length === 0)) {
      return res.status(400).json({ message: 'Vui lòng chọn ít nhất 1 danh mục' });
    }
    if (applyType === 'subcategories' && (!subcategoryIds || subcategoryIds.length === 0)) {
      return res.status(400).json({ message: 'Vui lòng chọn ít nhất 1 danh mục con' });
    }

    // Tạo promotion mới
    const promotion = new Promotion({
      name,
      discountPercent,
      isActive: isActive !== false, // Default true
      applyType,
      accountIds: applyType === 'accounts' ? accountIds : [],
      categoryIds: applyType === 'categories' ? categoryIds : [],
      subcategoryIds: applyType === 'subcategories' ? subcategoryIds : [],
      startDate: startDate || null,
      endDate: endDate || null,
      createdBy: req.user._id,
    });

    await promotion.save();

    // Clear cache
    clearPromotionCache();

    res.status(201).json(promotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ message: 'Lỗi khi tạo khuyến mãi' });
  }
});

// PUT /admin/promotions/:id - Cập nhật promotion
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      discountPercent,
      isActive,
      applyType,
      accountIds,
      categoryIds,
      subcategoryIds,
      startDate,
      endDate,
    } = req.body;

    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }

    // Validation
    if (discountPercent !== undefined && (discountPercent < 0 || discountPercent > 100)) {
      return res.status(400).json({ message: '% giảm giá phải từ 0-100' });
    }

    // Update fields
    if (name !== undefined) promotion.name = name;
    if (discountPercent !== undefined) promotion.discountPercent = discountPercent;
    if (isActive !== undefined) promotion.isActive = isActive;
    if (applyType !== undefined) promotion.applyType = applyType;
    if (startDate !== undefined) promotion.startDate = startDate || null;
    if (endDate !== undefined) promotion.endDate = endDate || null;

    // Update IDs based on applyType
    if (promotion.applyType === 'accounts') {
      promotion.accountIds = accountIds || [];
      promotion.categoryIds = [];
      promotion.subcategoryIds = [];
    } else if (promotion.applyType === 'categories') {
      promotion.categoryIds = categoryIds || [];
      promotion.accountIds = [];
      promotion.subcategoryIds = [];
    } else if (promotion.applyType === 'subcategories') {
      promotion.subcategoryIds = subcategoryIds || [];
      promotion.accountIds = [];
      promotion.categoryIds = [];
    }

    await promotion.save();

    // Clear cache
    clearPromotionCache();

    res.json(promotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật khuyến mãi' });
  }
});

// PUT /admin/promotions/:id/toggle - Bật/tắt promotion
router.put('/:id/toggle', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }

    promotion.isActive = !promotion.isActive;
    await promotion.save();

    // Clear cache
    clearPromotionCache();

    res.json(promotion);
  } catch (error) {
    console.error('Error toggling promotion:', error);
    res.status(500).json({ message: 'Lỗi khi thay đổi trạng thái' });
  }
});

// DELETE /admin/promotions/:id - Xóa promotion
router.delete('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }

    // Clear cache
    clearPromotionCache();

    res.json({ message: 'Đã xóa khuyến mãi' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ message: 'Lỗi khi xóa khuyến mãi' });
  }
});

// GET /admin/promotions/:id/accounts - Xem danh sách tài khoản được áp dụng
router.get('/:id/accounts', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }

    let accounts = [];

    if (promotion.applyType === 'accounts') {
      accounts = await GameAccount.find({ _id: { $in: promotion.accountIds } })
        .select('code title price originalPrice category subcategory')
        .populate('category', 'name')
        .populate('subcategory', 'name')
        .lean();
    } else if (promotion.applyType === 'categories') {
      accounts = await GameAccount.find({ category: { $in: promotion.categoryIds } })
        .select('code title price originalPrice category subcategory')
        .populate('category', 'name')
        .populate('subcategory', 'name')
        .lean();
    } else if (promotion.applyType === 'subcategories') {
      accounts = await GameAccount.find({ subcategory: { $in: promotion.subcategoryIds } })
        .select('code title price originalPrice category subcategory')
        .populate('category', 'name')
        .populate('subcategory', 'name')
        .lean();
    }

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching promotion accounts:', error);
    res.status(500).json({ message: 'Lỗi khi tải danh sách tài khoản' });
  }
});

export default router;
