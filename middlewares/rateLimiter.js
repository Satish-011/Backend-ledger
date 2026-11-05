// middlewares/rateLimiter.js
const redis = require('../utils/redisClient');

// Custom Sliding Window Rate Limiter Factory Function
const slidingWindowLimiter = (windowMs, maxRequests, errorMessage) => {
    return async (req, res, next) => {
        try {
            const ip = req.ip || req.connection.remoteAddress;
            // Key route aur IP dono par based hogi
            const key = `ratelimit:${req.baseUrl || req.path}:${ip}`;
            
            const now = Date.now();
            const windowStart = now - windowMs; // Window ka starting time

            // Redis Pipeline use karenge taaki saari commands ek sath fast execute hon
            const pipeline = redis.pipeline();

            // 1. Purane timestamps hatao jo window se bahar nikal chuke hain
            pipeline.zremrangebyscore(key, 0, windowStart);

            // 2. Naya request timestamp add karo
            pipeline.zadd(key, now, now);

            // 3. Current window mein total requests count karo
            pipeline.zcard(key);

            // 4. Memory bachane ke liye key ki expiry set karo
            pipeline.pexpire(key, windowMs);

            // Saari commands ek sath Redis par fire karo
            const results = await pipeline.exec();

            // results array ka 3rd item (index 2) zcard ka result deta hai: [error, count]
            const requestCount = results[2][1]; 

            if (requestCount > maxRequests) {
                return res.status(429).json({ 
                    message: errorMessage || "Too many requests. Please try again later." 
                });
            }

            next();
        } catch (error) {
            console.error("[RateLimiter Error]", error.message);
            // Agar Redis fail ho jaye, toh requests block na hon (Fail-Open Strategy)
            next(); 
        }
    };
};

// 1. General Limiter (15 min mein 100 requests)
const generalLimiter = slidingWindowLimiter(
    15 * 60 * 1000, 
    100, 
    "Aapne bohot zyada requests bhej di hain. Kripya 15 minute baad try karein."
);

// 2. Auth Limiter (15 min mein max 10 requests)
const authLimiter = slidingWindowLimiter(
    15 * 60 * 1000, 
    10, 
    "Bohot zyada login attempts. Security ke liye aapko block kiya gaya hai. 15 minute baad try karein."
);

module.exports = { authLimiter, generalLimiter };