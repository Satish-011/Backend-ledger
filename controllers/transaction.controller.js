const mongoose = require("mongoose");
const User = require("../models/user.model");
const Account = require("../models/account.model");
const Transaction = require("../models/transaction.model");
const Ledger = require("../models/ledger.model");
const redis = require("../utils/redisClient");
const emailQueue = require("../utils/emailQueue");

const transferMoney = async (req, res, next) => {
  const { receiverEmail, amount, idempotencyKey } = req.body;
  const senderUserId = req.userId;

  if (!idempotencyKey)
    return res.status(400).json({ message: "idempotencyKey is required!" });
  if (amount <= 0)
    return res
      .status(400)
      .json({ message: "Amount must be greater than zero!" });

  try {
    const senderUser = await User.findById(senderUserId);
    if (senderUser.email === receiverEmail)
      return res
        .status(400)
        .json({ message: "Cannot send funds to yourself." });

    const senderAccount = await Account.findOne({ userId: senderUserId });
    if (!senderAccount || senderAccount.status !== "ACTIVE")
      return res.status(403).json({ message: "Sender account not active." });

    // Idempotency Check
    const existingTx = await Transaction.findOne({
      senderId: senderAccount._id,
      idempotencyKey,
    });
    if (existingTx)
      return res
        .status(200)
        .json({
          message: "Transaction already processed.",
          transactionId: existingTx._id,
        });

    const receiverUser = await User.findOne({ email: receiverEmail });
    if (!receiverUser)
      return res.status(404).json({ message: "Receiver not found." });

    const receiverAccount = await Account.findOne({ userId: receiverUser._id });
    if (!receiverAccount || receiverAccount.status !== "ACTIVE")
      return res.status(403).json({ message: "Receiver account not active." });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const lockedSender = await Account.findById(senderAccount._id).session(
        session,
      );
      const lockedReceiver = await Account.findById(
        receiverAccount._id,
      ).session(session);

      if (lockedSender.balance < amount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Insufficient balance!" });
      }

      lockedSender.balance -= amount;
      lockedReceiver.balance += amount;

      await lockedSender.save({ session });
      await lockedReceiver.save({ session });

      const transaction = new Transaction({
        transactionType: "TRANSFER",
        senderId: lockedSender._id,
        receiverId: lockedReceiver._id,
        amount,
        idempotencyKey,
        status: "SUCCESS",
      });
      await transaction.save({ session });

      await Ledger.create(
        [
          {
            transactionId: transaction._id,
            accountId: lockedSender._id,
            type: "DEBIT",
            amount,
            balanceAfter: lockedSender.balance,
          },
          {
            transactionId: transaction._id,
            accountId: lockedReceiver._id,
            type: "CREDIT",
            amount,
            balanceAfter: lockedReceiver.balance,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      await redis.del(`history:${senderUserId}`);
      await redis.del(`history:${receiverUser._id}`);

      await emailQueue.add("transfer-email", {
        email: receiverUser.email,
        subject: "Funds Received!",
        html: `<p>You received Rs ${amount} from ${senderUser.name}.</p>`,
      });

      res
        .status(200)
        .json({
          message: `Success! Rs ${amount} transferred to ${receiverUser.name}`,
          transactionId: transaction._id,
        });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(200)
        .json({ message: "Transaction processed concurrently." });
    next(error);
  }
};

const depositMoney = async (req, res, next) => {
  const { amount, idempotencyKey } = req.body;
  if (!idempotencyKey)
    return res.status(400).json({ message: "idempotencyKey is required!" });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await Account.findOne({ userId: req.userId }).session(
      session,
    );

    const existingTx = await Transaction.findOne({
      receiverId: account._id,
      idempotencyKey,
    }).session(session);
    if (existingTx) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(200)
        .json({ message: "Already deposited", transactionId: existingTx._id });
    }

    account.balance += amount;
    await account.save({ session });

    const transaction = new Transaction({
      transactionType: "DEPOSIT",
      receiverId: account._id,
      amount,
      idempotencyKey,
      status: "SUCCESS",
    });
    await transaction.save({ session });

    await Ledger.create(
      [
        {
          transactionId: transaction._id,
          accountId: account._id,
          type: "CREDIT",
          amount,
          balanceAfter: account.balance,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    await redis.del(`history:${req.userId}`);
    res
      .status(200)
      .json({
        message: `Success! Rs ${amount} deposited.`,
        newBalance: account.balance,
        transactionId: transaction._id,
      });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

const withdrawMoney = async (req, res, next) => {
  const { amount, idempotencyKey } = req.body;
  if (!idempotencyKey)
    return res.status(400).json({ message: "idempotencyKey is required!" });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await Account.findOne({ userId: req.userId }).session(
      session,
    );
    if (account.balance < amount) throw new Error("Insufficient balance!");

    const existingTx = await Transaction.findOne({
      senderId: account._id,
      idempotencyKey,
    }).session(session);
    if (existingTx) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(200)
        .json({ message: "Already withdrawn", transactionId: existingTx._id });
    }

    account.balance -= amount;
    await account.save({ session });

    const transaction = new Transaction({
      transactionType: "WITHDRAWAL",
      senderId: account._id,
      amount,
      idempotencyKey,
      status: "SUCCESS",
    });
    await transaction.save({ session });

    await Ledger.create(
      [
        {
          transactionId: transaction._id,
          accountId: account._id,
          type: "DEBIT",
          amount,
          balanceAfter: account.balance,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    await redis.del(`history:${req.userId}`);
    res
      .status(200)
      .json({
        message: `Success! Rs ${amount} withdrawn.`,
        newBalance: account.balance,
        transactionId: transaction._id,
      });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const hashKey = `history:${req.userId}`;
    const fieldKey = `page:${page}:limit:${limit}`;

    const cachedHistory = await redis.hget(hashKey, fieldKey);
    if (cachedHistory) return res.status(200).json(JSON.parse(cachedHistory));

    const userAccount = await Account.findOne({ userId: req.userId });
    const queryCondition = {
      $or: [{ senderId: userAccount._id }, { receiverId: userAccount._id }],
    };

    const totalTransactions = await Transaction.countDocuments(queryCondition);
    const transactions = await Transaction.find(queryCondition)
      .populate("senderId")
      .populate("receiverId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const responseData = {
      message: "Transaction history fetched successfully",
      pagination: {
        totalRecords: totalTransactions,
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
      },
      transactions,
    };

    await redis.hset(hashKey, fieldKey, JSON.stringify(responseData));
    await redis.expire(hashKey, 300);

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { transferMoney, depositMoney, withdrawMoney, getHistory };
