const jwt = require('jsonwebtoken');
const redis = require('../utils/redisClient'); 

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(401).json({ message: "Access denied. Token missing!" });

        const isBlacklisted = await redis.get(`blacklist_token:${token}`);
        if (isBlacklisted) return res.status(401).json({ message: "Session expired (logged out). Please login again." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token!" });
    }
};

module.exports = protect;