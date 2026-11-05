// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Logs ko JSON format mein save karega (Machine readable)
    ),
    transports: [
        // Sirf errors ke liye alag file
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Har tarah ke logs (info, warn, error) ke liye combined file
        new winston.transports.File({ filename: 'logs/combined.log' })
    ],
});

// Agar hum production mein nahi hain (development mein hain), toh console par bhi print karo
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(), // Console mein mast colors aayenge
            winston.format.simple()
        )
    }));
}

module.exports = logger;