const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controller/account.controller");

router.post(
  "/create",
  authMiddleware.authMiddleware,
  accountController.createAccountController,
);

router.get(
  "/get",
  authMiddleware.authMiddleware,
  accountController.getAccountsController,
);

router.get(
  "/balance/:accountId",
  authMiddleware.authMiddleware,
  accountController.getAccountBalanceController,
);

module.exports = router;
