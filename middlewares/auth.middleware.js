// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const redis = require('../utils/redisClient'); // NAYA: Redis Client

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Access denied. Ticket (cookie) nahi mila!" });
        }

        // NAYA: Redis cache check karna
        const isBlacklisted = await redis.get(`blacklist_token:${token}`);
        
        if (isBlacklisted) {
            return res.status(401).json({ message: "Ye session expire (logout) ho chuka hai. Wapas login karein." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid ya expired token!" });
    }
};

module.exports = protect;