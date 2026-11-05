// controllers/transaction.controller.js
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Account = require('../models/account.model');
const Transaction = require('../models/transaction.model');
const Ledger = require('../models/ledger.model');
const redis = require('../utils/redisClient'); // NAYA: Redis Import kiya

// ==========================================
// 1. TRANSFER MONEY
// ==========================================
const transferMoney = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { receiverEmail, amount } = req.body;
        const senderId = req.userId;

        if (amount <= 0) throw new Error("Amount 0 se zyada hona chahiye!");

        const receiver = await User.findOne({ email: receiverEmail }).session(session);
        if (!receiver) throw new Error("Jisko paise bhej rahe hain, wo email nahi mila.");

        if (senderId === receiver._id.toString()) throw new Error("Aap khud ko paise nahi bhej sakte!");

        const senderAccount = await Account.findOne({ userId: senderId }).session(session);
        const receiverAccount = await Account.findOne({ userId: receiver._id }).session(session);

        if (senderAccount.balance < amount) throw new Error("Aapke account mein balance kam hai!");

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

        const debitEntry = new Ledger({ transactionId: transaction._id, accountId: senderAccount._id, type: 'DEBIT', amount: amount });
        const creditEntry = new Ledger({ transactionId: transaction._id, accountId: receiverAccount._id, type: 'CREDIT', amount: amount });
        
        await debitEntry.save({ session });
        await creditEntry.save({ session });

        await session.commitTransaction();
        session.endSession();

        // CACHE INVALIDATION: Sender aur Receiver dono ki history badal gayi, toh dono ka cache delete kardo
        await redis.del(`history:${senderId}`);
        await redis.del(`history:${receiver._id}`);

        res.status(200).json({ message: `Success! Rs ${amount} transferred to ${receiver.name}`, transactionId: transaction._id });
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

        const transaction = new Transaction({ transactionType: 'DEPOSIT', receiverId: userId, amount: amount, status: 'SUCCESS' });
        await transaction.save({ session });

        const ledgerEntry = new Ledger({ transactionId: transaction._id, accountId: account._id, type: 'CREDIT', amount: amount });
        await ledgerEntry.save({ session });

        await session.commitTransaction();
        session.endSession();

        // CACHE INVALIDATION: Balance update hua, purana cache delete karo
        await redis.del(`history:${userId}`);

        res.status(200).json({ message: `Success! Rs ${amount} deposited.`, newBalance: account.balance, transactionId: transaction._id });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: "Deposit failed", error: error.message });
    }
};

// ==========================================
// 3. WITHDRAW MONEY
// ==========================================
const withdrawMoney = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount } = req.body;
        const userId = req.userId;

        if (amount <= 0) throw new Error("Amount 0 se zyada hona chahiye!");

        const account = await Account.findOne({ userId: userId }).session(session);
        if (!account) throw new Error("Account nahi mila!");
        if (account.balance < amount) throw new Error("Account mein sufficient balance nahi hai!");

        account.balance -= amount;
        await account.save({ session });

        const transaction = new Transaction({ transactionType: 'WITHDRAWAL', senderId: userId, amount: amount, status: 'SUCCESS' });
        await transaction.save({ session });

        const ledgerEntry = new Ledger({ transactionId: transaction._id, accountId: account._id, type: 'DEBIT', amount: amount });
        await ledgerEntry.save({ session });

        await session.commitTransaction();
        session.endSession();

        // CACHE INVALIDATION: Balance kam hua, purana cache delete karo
        await redis.del(`history:${userId}`);

        res.status(200).json({ message: `Success! Rs ${amount} withdrawn.`, newBalance: account.balance, transactionId: transaction._id });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: "Withdrawal failed", error: error.message });
    }
};

// ==========================================
// 4. GET TRANSACTION HISTORY (Redis Caching)
// ==========================================
const getHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 1. Cache Keys (User ki history ek hash map me save hogi, field usko page number hoga)
        const hashKey = `history:${req.userId}`;
        const fieldKey = `page:${page}:limit:${limit}`;

        // 2. CHECK REDIS (Cache Hit ya Miss)
        const cachedHistory = await redis.hget(hashKey, fieldKey);
        
        if (cachedHistory) {
            console.log(`[Cache Hit] Redis se history aayi user: ${req.userId} ke liye`);
            return res.status(200).json(JSON.parse(cachedHistory)); // Redis hamesha string deta hai, usko parse karna padta hai
        }

        console.log(`[Cache Miss] MongoDB se history nikal raha hu user: ${req.userId} ke liye`);

        // 3. Database Query (Kyunki cache mein nahi tha)
        const queryCondition = { $or: [{ senderId: req.userId }, { receiverId: req.userId }] };
        const totalTransactions = await Transaction.countDocuments(queryCondition);
        const transactions = await Transaction.find(queryCondition)
            .populate('senderId', 'name email')
            .populate('receiverId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const responseData = {
            message: "Transaction history fetched successfully",
            pagination: {
                totalRecords: totalTransactions,
                currentPage: page,
                totalPages: Math.ceil(totalTransactions / limit),
                hasNextPage: page * limit < totalTransactions,
                hasPrevPage: page > 1
            },
            transactions: transactions
        };

        // 4. SAVE TO REDIS
        await redis.hset(hashKey, fieldKey, JSON.stringify(responseData));
        await redis.expire(hashKey, 300); // 5 minute (300 sec) ki general expiry tak ki RAM free rahe

        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { transferMoney, depositMoney, withdrawMoney, getHistory };