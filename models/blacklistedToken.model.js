// models/blacklistedToken.model.js
const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    // createdAt zaroori hai automatic delete (TTL) ke liye
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 86400 seconds = 1 day (uske baad DB se khud hat jayega)
    }
});

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);