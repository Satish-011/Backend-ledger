const accountModel = require("../models/account.model");
const { NotFoundError } = require("../errors");

const createAccountController = async (req, res, next) => {
  try {
    const account = await accountModel.create({ user: req.user._id });

    return res.status(201).json({
      success: true,
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
      success: true,
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
      throw new NotFoundError("Account not found", "ACCOUNT_NOT_FOUND");
    }

    const balance = await account.getBalance();

    return res.status(200).json({
      success: true,
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
