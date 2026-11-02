// models/transaction.model.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    receiverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true, 
        min: 1 // Kam se kam 1 Rs bhejna hoga
    },
    status: { 
        type: String, 
        enum: ['PENDING', 'SUCCESS', 'FAILED'], 
        default: 'PENDING' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);