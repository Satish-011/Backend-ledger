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

module.exports = {
  createAccountController,
};
