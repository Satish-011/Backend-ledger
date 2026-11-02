// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    try {
        // NAYA: Token ab req.cookies se nikalenge (req.headers se nahi)
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Access denied. Ticket (cookie) nahi mila!" });
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