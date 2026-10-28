const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Account must be associated with a user"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "frozen", "closed"],
        message: "Account status can be only active, frozen or closed",
      },
      default: "active",
    },
    currency: {
      type: String,
      required: [true, "currency is required for creting an account"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function () {
  const ledgerModel = mongoose.model("ledger");
  const result = await ledgerModel.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totalCredit: {
          $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0] },
        },
        totalDebit: {
          $sum: { $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0] },
        },
      },
    },
    {
      $project: {
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);

  return result.length > 0 ? result[0].balance : 0;
};

const accountModel = mongoose.model("account", accountSchema);
module.exports = accountModel;
