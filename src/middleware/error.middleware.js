const logger = require("../config/logger");
const { AppError } = require("../errors/app.error");

/**
 * Centralized error-handling middleware.
 * Formats errors and logs appropriately with Winston.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === "CastError") {
    error = new AppError(`Invalid value for ${err.path}: ${err.value}`, 400, "INVALID_ID");
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new AppError(`${field} already exists`, 409, "DUPLICATE_KEY");
  }

  // Handle JWT errors if passed directly
  if (err.name === "TokenExpiredError") {
    error = new AppError("Token has expired", 401, "TOKEN_EXPIRED");
  } else if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token", 401, "TOKEN_INVALID");
  }

  const statusCode = error.statusCode || 500;
  const code = error.code || (statusCode >= 500 ? "SERVER_ERROR" : "ERROR");
  const message = error.message || "Internal server error";

  // Log based on severity
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${statusCode} [${code}]: ${error.stack || message}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${statusCode} [${code}]: ${message}`);
  }

  const response = {
    success: false,
    code,
    message,
  };

  if (error.details) {
    response.details = error.details;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
