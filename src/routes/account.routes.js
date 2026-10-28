const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { accountBalanceParamsSchema } = require("../validations/account.validation");
const accountController = require("../controller/account.controller");

router.post("/create", authMiddleware, accountController.createAccountController);
router.get("/get", authMiddleware, accountController.getAccountsController);
router.get(
  "/balance/:accountId",
  authMiddleware,
  validate(accountBalanceParamsSchema, "params"),
  accountController.getAccountBalanceController,
);

module.exports = router;
