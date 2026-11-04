// models/transaction.model.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionType: { 
        type: String, 
        enum: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL'], 
        default: 'TRANSFER' 
    },
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    receiverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    amount: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    status: { 
        type: String, 
        enum: ['PENDING', 'SUCCESS', 'FAILED'], 
        default: 'PENDING' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);