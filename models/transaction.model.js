const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionType: { 
        type: String, 
        enum: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL'], 
        default: 'TRANSFER' 
    },
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Account' // Linked to Account, not User
    },
    receiverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Account' 
    },
    amount: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    idempotencyKey: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['PENDING', 'SUCCESS', 'FAILED'], 
        default: 'PENDING' 
    }
}, { timestamps: true });

// Prevent double-spending for the same request
transactionSchema.index({ senderId: 1, idempotencyKey: 1 }, { unique: true });

module.exports = mongoose.model('Transaction', transactionSchema);