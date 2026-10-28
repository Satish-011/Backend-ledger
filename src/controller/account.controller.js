const accountModel = require("../models/account.model");

const createAccountController = async (req, res) => {
  try {
    const userId = req.user._id;
    const account = await accountModel.create({
      user: userId,
    });

    res.status(201).json({
      message: "Account created successfully",
      account: account,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating account",
      error: error.message,
    });
  }
};

const getAccountsController = async (req, res) => {
  const accounts = await accountModel.find({ user: req.user._id });
  res.status(200).json({
    message: "Accounts retrieved successfully",
    accounts: accounts,
  });
};

const getAccountBalanceController = async (req, res) => {
  try {
    const accountId = req.params.accountId;

    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const balance = await account.getBalance();

    return res.status(200).json({
      message: "Account balance retrieved successfully",
      balance: balance,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createAccountController,
  getAccountsController,
  getAccountBalanceController,
};
