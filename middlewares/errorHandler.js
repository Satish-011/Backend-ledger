// middlewares/errorHandler.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Agar err mein statusCode hai (yani humara custom error hai) toh wo use karo, warna 500 Default
    let statusCode = err.statusCode || 500;
    let code = err.code || "SERVER_ERROR";
    let message = err.message || "Something went wrong on the server";

    // 1. WINSTON LOGGING
    if (statusCode >= 500) {
        logger.error(`[${req.method}] ${req.originalUrl} - ${code}: ${message} - IP: ${req.ip} - Stack: ${err.stack}`);
    } else {
        // 4xx errors (jaise bad request) ko warning ki tarah log kar sakte hain
        logger.warn(`[${req.method}] ${req.originalUrl} - ${code}: ${message} - IP: ${req.ip}`);
    }

    // 2. SEND RESPONSE TO CLIENT
    res.status(statusCode).json({
        success: false,
        error: {
            code: code,
            message: message,
            // Stack trace sirf development environment mein bhejenge, production mein nahi (security ke liye)
            stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
        }
    });
};

module.exports = errorHandler;