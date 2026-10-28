const accountModel = require("../models/account.model");

const createAccountController = async (req, res, next) => {
  try {
    const account = await accountModel.create({ user: req.user._id });

    return res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    next(error);
  }
};

const getAccountsController = async (req, res, next) => {
  try {
    const accounts = await accountModel.find({ user: req.user._id });

    return res.status(200).json({
      message: "Accounts retrieved successfully",
      accounts,
    });
  } catch (error) {
    next(error);
  }
};

const getAccountBalanceController = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const balance = await account.getBalance();

    return res.status(200).json({
      message: "Account balance retrieved successfully",
      balance,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccountController,
  getAccountsController,
  getAccountBalanceController,
};
