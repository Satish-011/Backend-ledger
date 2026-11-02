// app.js
const express = require("express");
const app = express();

// Ye line aane wale JSON data ko read karti hai
app.use(express.json());

// Routes ko import karna
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const transactionRoutes = require("./routes/transaction.routes");

// API ka base URL set karna
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.send("Bank API is running from app.js!");
});

module.exports = app;
