const { Router } = require("express");
const transactionController = require("../controller/transaction.controller");
const {
  authMiddleware,
  authsystemUserMiddleware,
} = require("../middleware/auth.middleware");

const transactionRoutes = Router();

transactionRoutes.post(
  "/",
  authMiddleware,
  transactionController.createTransaction,
);

transactionRoutes.post(
  "/system/initial-funds",
  authsystemUserMiddleware,
  transactionController.createInitialFundsTransaction,
);

module.exports = transactionRoutes;
