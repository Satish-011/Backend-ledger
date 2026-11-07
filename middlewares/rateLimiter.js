const redis = require("../utils/redisClient");

const slidingWindowLimiter = (windowMs, maxRequests, errorMessage) => {
  return async (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const key = `ratelimit:${req.baseUrl || req.path}:${ip}`;

      const now = Date.now();
      const windowStart = now - windowMs;

      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zadd(key, now, now);
      pipeline.zcard(key);
      pipeline.pexpire(key, windowMs);

      const results = await pipeline.exec();
      const requestCount = results[2][1];

      if (requestCount > maxRequests) {
        return res
          .status(429)
          .json({ message: errorMessage || "Too many requests." });
      }
      next();
    } catch (error) {
      console.error("[RateLimiter Error]", error.message);
      next();
    }
  };
};

const generalLimiter = slidingWindowLimiter(
  15 * 60 * 1000,
  100,
  "Limit exceeded. Try again in 15 mins.",
);
const authLimiter = slidingWindowLimiter(
  15 * 60 * 1000,
  10,
  "Too many login attempts. Try again in 15 mins.",
);

module.exports = { authLimiter, generalLimiter };
