const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Strictly enforces 1 User = 1 Account
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: 0 // Prevents negative balances
    },
    status: { 
        type: String, 
        enum: ['ACTIVE', 'SUSPENDED', 'FROZEN'], 
        default: 'ACTIVE' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);