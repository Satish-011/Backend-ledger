const mongoose = require("mongoose");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");

/**
 * Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request (handled by Zod middleware)
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */
async function createTransaction(req, res, next) {
  try {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    // TODO: implement the 10-step transfer flow
  } catch (error) {
    next(error);
  }
}

async function createInitialFundsTransaction(req, res, next) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { toAccount, amount, idempotencyKey } = req.body;

    const toUserAccount = await accountModel.findById(toAccount);

    if (!toUserAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    const fromUserAccount = await accountModel.findOne({
      user: req.user._id,
      systemUser: true,
    });

    if (!fromUserAccount) {
      return res
        .status(403)
        .json({ message: "Forbidden: User is not a system user" });
    }

    const transaction = new transactionModel({
      fromAccount: fromUserAccount._id,
      toAccount: toUserAccount._id,
      amount,
      idempotencyKey,
      status: "pending",
    });

    await transaction.save({ session });

    await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
          amount,
          type: "debit",
          transaction: transaction._id,
        },
      ],
      { session },
    );

    await ledgerModel.create(
      [
        {
          account: toUserAccount._id,
          amount,
          type: "credit",
          transaction: transaction._id,
        },
      ],
      { session },
    );

    transaction.status = "completed";
    await transaction.save({ session });

    await session.commitTransaction();

    await emailService.sendTransactionEmail(
      req.user.email,
      req.user.name,
      amount,
      toAccount,
    );

    return res.status(201).json({
      message: "Transaction completed successfully",
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};
