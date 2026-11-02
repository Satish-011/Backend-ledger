// controllers/transaction.controller.js
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Account = require('../models/account.model');
const Transaction = require('../models/transaction.model');
const Ledger = require('../models/ledger.model');

const transferMoney = async (req, res) => {
    // 1. Transaction Session Start karna (Taaki fail hone par sab Rollback ho sake)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { receiverEmail, amount } = req.body;
        const senderId = req.userId; // Ye humare auth middleware ne diya hai

        if (amount <= 0) {
            throw new Error("Amount 0 se zyada hona chahiye!");
        }

        // 2. Receiver ko find karna
        const receiver = await User.findOne({ email: receiverEmail }).session(session);
        if (!receiver) {
            throw new Error("Jisko paise bhej rahe hain, wo email nahi mila.");
        }

        if (senderId === receiver._id.toString()) {
            throw new Error("Aap khud ko paise nahi bhej sakte!");
        }

        // 3. Sender aur Receiver ke accounts nikalna
        const senderAccount = await Account.findOne({ userId: senderId }).session(session);
        const receiverAccount = await Account.findOne({ userId: receiver._id }).session(session);

        // 4. Balance check karna
        if (senderAccount.balance < amount) {
            throw new Error("Aapke account mein balance kam hai!");
        }

        // 5. Balance update karna (Memory mein)
        senderAccount.balance -= amount;
        receiverAccount.balance += amount;

        // Dono accounts ko database mein save karna (session ke sath)
        await senderAccount.save({ session });
        await receiverAccount.save({ session });

        // 6. Naya Transaction record banana
        const transaction = await Transaction.create([{
            senderId: senderId,
            receiverId: receiver._id,
            amount: amount,
            status: 'SUCCESS'
        }], { session: session });

        // 7. Ledger Book mein pakki entry karna (Double-entry)
        await Ledger.create([{
            transactionId: transaction[0]._id,
            accountId: senderAccount._id,
            type: 'DEBIT', // Sender ke account se kate
            amount: amount
        }, {
            transactionId: transaction[0]._id,
            accountId: receiverAccount._id,
            type: 'CREDIT', // Receiver ke account mein aaye
            amount: amount
        }], { session: session });

        // 8. Sab kuch theek raha, ab Data ko PAKKA (Commit) kar do
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: `Success! Rs ${amount} transferred to ${receiver.name}`,
            transactionId: transaction[0]._id
        });

    } catch (error) {
        // Agar upar koi bhi error aaya, toh sab kuch ROLLBACK kar do
        await session.abortTransaction();
        session.endSession();
        
        res.status(400).json({ message: "Transaction failed", error: error.message });
    }
};

module.exports = { transferMoney };