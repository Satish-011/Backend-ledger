const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { NotFoundError } = require("./utils/error");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const transactionRoutes = require("./routes/transaction.routes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("Bank API is running securely!");
});

app.use((req, res, next) => {
  next(
    new NotFoundError(`Route ${req.originalUrl} not found!`, "ROUTE_NOT_FOUND"),
  );
});

app.use(errorHandler);

module.exports = app;
