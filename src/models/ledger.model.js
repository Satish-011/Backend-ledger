const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: [true, "Ledger must be associated with an account"],
      index: true,
      immutable: true,
    },
    amount: {
      type: Number,
      required: [true, "Ledger must have an amount"],
      immutable: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
      immutable: true,
      required: [true, "Ledger must be associated with a transaction"],
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: [true, "Ledger must have a type"],
    },
  },
  {
    timestamps: true,
  },
);

const preventLedgerModification = () => {
  throw new Error("Ledger entries cannot be modified after creation");
};

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("update", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);

const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel;
