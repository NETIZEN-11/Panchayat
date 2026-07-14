/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP
 */

const rateLimit = {};

const rateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later.',
  } = options;

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimit[ip]) {
      rateLimit[ip] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    if (now > rateLimit[ip].resetTime) {
      rateLimit[ip] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    if (rateLimit[ip].count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message,
      });
    }

    rateLimit[ip].count++;
    next();
  };
};

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimit).forEach((ip) => {
    if (now > rateLimit[ip].resetTime) {
      delete rateLimit[ip];
    }
  });
}, 60 * 60 * 1000);

module.exports = rateLimiter;
