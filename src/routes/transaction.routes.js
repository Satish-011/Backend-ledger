const { Router } = require("express");
const { authMiddleware, authsystemUserMiddleware } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { createTransactionSchema, initialFundsSchema } = require("../validations/transaction.validation");
const transactionController = require("../controller/transaction.controller");

const transactionRoutes = Router();

transactionRoutes.post(
  "/",
  authMiddleware,
  validate(createTransactionSchema),
  transactionController.createTransaction,
);

transactionRoutes.post(
  "/system/initial-funds",
  authsystemUserMiddleware,
  validate(initialFundsSchema),
  transactionController.createInitialFundsTransaction,
);

module.exports = transactionRoutes;
