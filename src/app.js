const express = require("express");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error.middleware");
const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/transactions", transactionRoutes);

// Centralized error handler (must be after routes)
app.use(errorHandler);

module.exports = app;
