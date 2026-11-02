// models/ledger.model.js
const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    transactionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Transaction', 
        required: true 
    },
    accountId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Account', 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['CREDIT', 'DEBIT'], 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    }
}, { timestamps: true });

// SECURITY FEATURE: Bank ka khata ek baar likh diya, toh koi edit nahi kar sakta
ledgerSchema.pre('findOneAndUpdate', function(next) {
    next(new Error("Ledger entries strictly cannot be modified!"));
});

module.exports = mongoose.model('Ledger', ledgerSchema);