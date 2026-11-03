// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/blacklistedToken.model'); // NAYA: Model import kiya

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Access denied. Ticket (cookie) nahi mila!" });
        }

        // NAYA SECURITY CHECK: Kya ye token Blocked List mein hai?
        const isBlacklisted = await BlacklistedToken.findOne({ token: token });
        if (isBlacklisted) {
            return res.status(401).json({ message: "Ye session expire (logout) ho chuka hai. Wapas login karein." });
        }

        // Token verify karna
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid ya expired token!" });
    }
};

module.exports = protect;