// controllers/transaction.controller.js
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Account = require('../models/account.model');
const Transaction = require('../models/transaction.model');
const Ledger = require('../models/ledger.model');

// ==========================================
// 1. TRANSFER MONEY
// ==========================================
const transferMoney = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { receiverEmail, amount } = req.body;
        const senderId = req.userId;

        if (amount <= 0) {
            throw new Error("Amount 0 se zyada hona chahiye!");
        }

        const receiver = await User.findOne({ email: receiverEmail }).session(session);
        if (!receiver) {
            throw new Error("Jisko paise bhej rahe hain, wo email nahi mila.");
        }

        if (senderId === receiver._id.toString()) {
            throw new Error("Aap khud ko paise nahi bhej sakte!");
        }

        const senderAccount = await Account.findOne({ userId: senderId }).session(session);
        const receiverAccount = await Account.findOne({ userId: receiver._id }).session(session);

        if (senderAccount.balance < amount) {
            throw new Error("Aapke account mein balance kam hai!");
        }

        senderAccount.balance -= amount;
        receiverAccount.balance += amount;

        await senderAccount.save({ session });
        await receiverAccount.save({ session });

        const transaction = new Transaction({
            transactionType: 'TRANSFER',
            senderId: senderId,
            receiverId: receiver._id,
            amount: amount,
            status: 'SUCCESS'
        });
        await transaction.save({ session });

        const debitEntry = new Ledger({
            transactionId: transaction._id,
            accountId: senderAccount._id,
            type: 'DEBIT', 
            amount: amount
        });
        await debitEntry.save({ session });

        const creditEntry = new Ledger({
            transactionId: transaction._id,
            accountId: receiverAccount._id,
            type: 'CREDIT', 
            amount: amount
        });
        await creditEntry.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: `Success! Rs ${amount} transferred to ${receiver.name}`,
            transactionId: transaction._id
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: "Transaction failed", error: error.message });
    }
};

// ==========================================
// 2. DEPOSIT MONEY
// ==========================================
const depositMoney = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount } = req.body;
        const userId = req.userId;

        if (amount <= 0) throw new Error("Amount 0 se zyada hona chahiye!");

        const account = await Account.findOne({ userId: userId }).session(session);
        if (!account) throw new Error("Account nahi mila!");

        account.balance += amount;
        await account.save({ session });

        const transaction = new Transaction({
            transactionType: 'DEPOSIT',
            receiverId: userId,
            amount: amount,
            status: 'SUCCESS'
        });
        await transaction.save({ session });

        const ledgerEntry = new Ledger({
            transactionId: transaction._id,
            accountId: account._id,
            type: 'CREDIT',
            amount: amount
        });
        await ledgerEntry.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: `Success! Rs ${amount} deposited to your account.`,
            newBalance: account.balance,
            transactionId: transaction._id
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: "Deposit failed", error: error.message });
    }
};

// ==========================================
// 3. GET TRANSACTION HISTORY
// ==========================================
const getHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [{ senderId: req.userId }, { receiverId: req.userId }]
        })
        .populate('senderId', 'name email')
        .populate('receiverId', 'name email')
        .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Transaction history fetched successfully",
            count: transactions.length,
            transactions: transactions
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { transferMoney, depositMoney, getHistory };