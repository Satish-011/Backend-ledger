const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true, immutable: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, immutable: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true, immutable: true },
    amount: { type: Number, required: true, immutable: true },
    balanceAfter: { type: Number, required: true, immutable: true } // Crucial for audits
}, { timestamps: true });

module.exports = mongoose.model('Ledger', ledgerSchema);