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

const accountModel = mongoose.model("account", accountSchema);
module.exports = accountModel;
