import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

// Standard rate limiter for general public endpoints
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 1000, // Extremely generous in dev so hot-reloads never trigger 429
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in 15 minutes.',
  },
});

// Strict rate limiter for sensitive operations like contact submissions & estimator leads
export const formSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions received. Please wait a few minutes before submitting again.',
  },
});

// Auth rate limiter for login attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
});
