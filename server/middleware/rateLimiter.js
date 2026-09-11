import rateLimit from 'express-rate-limit';

// Rate limiter for spin API - prevent spam
export const spinLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 spins per minute per IP
  message: {
    message: 'Quá nhiều lượt quay. Vui lòng đợi 1 phút và thử lại.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Quá nhiều lượt quay. Vui lòng đợi 1 phút và thử lại.',
      retryAfter: 60
    });
  }
});

// Rate limiter for checkout/purchase - prevent spam purchases
export const purchaseLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Max 5 purchases per minute per IP
  message: {
    message: 'Quá nhiều giao dịch. Vui lòng đợi 1 phút và thử lại.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Quá nhiều giao dịch. Vui lòng đợi 1 phút và thử lại.',
      retryAfter: 60
    });
  }
});

// Rate limiter for deposit API
export const depositLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Max 3 deposit requests per minute per IP
  message: {
    message: 'Quá nhiều yêu cầu nạp tiền. Vui lòng đợi 1 phút và thử lại.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Quá nhiều yêu cầu nạp tiền. Vui lòng đợi 1 phút và thử lại.',
      retryAfter: 60
    });
  }
});

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 minutes per IP
  message: {
    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
