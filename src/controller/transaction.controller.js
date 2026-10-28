const transactionModel = require("../models/transaction.model");

const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");

const emailService = require("../services/email.service");

/**
 * Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
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

async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const toUserACcount = await accountModel.findOne({ _id: toAccount });

  if (!toUserACcount) {
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

  const session = await transactionModel.startSession();
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};
