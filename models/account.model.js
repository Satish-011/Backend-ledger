// models/account.model.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    // Ye batata hai ki ye account kis user ka hai
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Account mein kitne paise hain
    balance: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;