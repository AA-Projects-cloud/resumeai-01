const rateLimit = require('express-rate-limit');

// Global rate limiter: 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again after 15 minutes.' },
});

// Strict limiter for AI endpoints: 10 requests per minute
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI endpoint rate limit exceeded. Please wait a minute before trying again.' },
});

// Export limiter: 20 requests per minute
const exportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Export rate limit exceeded. Please wait before downloading again.' },
});

module.exports = { globalLimiter, aiLimiter, exportLimiter };
