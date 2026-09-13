import Promotion from '../models/Promotion.js';

// Cache for active promotions
let promotionCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60000; // 1 minute

/**
 * Clear promotion cache (call when promotions are modified)
 */
export function clearPromotionCache() {
  promotionCache = null;
  cacheTimestamp = null;
}

/**
 * Get active promotions with caching
 */
async function getActivePromotions() {
  const now = Date.now();
  
  // Return cached promotions if still valid
  if (promotionCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return promotionCache;
  }
  
  // Fetch fresh promotions
  promotionCache = await Promotion.find({ isActive: true });
  cacheTimestamp = now;
  
  return promotionCache;
}

/**
 * Find applicable promotion for an account
 * Priority: accounts > subcategories > categories
 * If multiple promotions apply, return the one with highest discount
 */
export function findApplicablePromotion(account, activePromotions) {
  if (!activePromotions || activePromotions.length === 0) return null;

  const applicablePromotions = activePromotions.filter(promo => {
    // Check if promotion is currently active (including date range)
    if (promo.isCurrentlyActive && typeof promo.isCurrentlyActive === 'function') {
      if (!promo.isCurrentlyActive()) return false;
    }

    // Check by apply type
    if (promo.applyType === 'accounts') {
      return promo.accountIds.some(id => id.toString() === account._id.toString());
    }
    
    if (promo.applyType === 'subcategories' && account.subcategoryId) {
      return promo.subcategoryIds.some(id => id.toString() === account.subcategoryId.toString());
    }
    
    if (promo.applyType === 'categories') {
      return promo.categoryIds.some(id => id.toString() === account.categoryId.toString());
    }

    return false;
  });

  // Return promotion with highest discount
  if (applicablePromotions.length === 0) return null;
  
  return applicablePromotions.reduce((highest, current) => {
    return current.discountPercent > highest.discountPercent ? current : highest;
  });
}

/**
 * Calculate display price for an account
 * Priority: promotion discount > admin discount
 */
export function calculateDisplayPrice(account, activePromotions = []) {
  const originalPrice = account.originalPrice || account.price;
  const adminDiscountPercent = account.adminDiscountPercent || 0;

  // Find applicable promotion
  const promotion = findApplicablePromotion(account, activePromotions);

  // Use promotion discount if available, otherwise use admin discount
  const discountPercent = promotion ? promotion.discountPercent : adminDiscountPercent;

  // Calculate final price
  const finalPrice = Math.round(originalPrice * (1 - discountPercent / 100));

  return {
    originalPrice,
    finalPrice,
    discountPercent,
    promotionName: promotion?.name || null,
    promotionId: promotion?._id || null,
    hasPromotion: !!promotion,
  };
}

/**
 * Calculate price from originalPrice and discount percent
 */
export function calculatePriceFromDiscount(originalPrice, discountPercent) {
  return Math.round(originalPrice * (1 - discountPercent / 100));
}

/**
 * Apply promotion pricing to accounts array
 */
export async function applyPromotionPricing(accounts) {
  // Get all active promotions (with caching)
  const activePromotions = await getActivePromotions();

  return accounts.map(account => {
    const accountObj = typeof account.toObject === 'function' ? account.toObject() : account;
    const pricing = calculateDisplayPrice(accountObj, activePromotions);
    
    return {
      ...accountObj,
      originalPrice: pricing.originalPrice,
      price: pricing.finalPrice,
      discountPercent: pricing.discountPercent,
      promotionName: pricing.promotionName,
      promotionId: pricing.promotionId,
      hasPromotion: pricing.hasPromotion,
    };
  });
}

/**
 * Apply promotion pricing to single account
 */
export async function applyPromotionPricingSingle(account) {
  const activePromotions = await getActivePromotions();
  const accountObj = typeof account.toObject === 'function' ? account.toObject() : account;
  const pricing = calculateDisplayPrice(accountObj, activePromotions);
  
  return {
    ...accountObj,
    originalPrice: pricing.originalPrice,
    price: pricing.finalPrice,
    discountPercent: pricing.discountPercent,
    promotionName: pricing.promotionName,
    promotionId: pricing.promotionId,
    hasPromotion: pricing.hasPromotion,
  };
}

export default {
  findApplicablePromotion,
  calculateDisplayPrice,
  calculatePriceFromDiscount,
  applyPromotionPricing,
  applyPromotionPricingSingle,
  clearPromotionCache,
};
