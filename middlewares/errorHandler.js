const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || "SERVER_ERROR";
  let message = err.message || "Something went wrong on the server";

  if (statusCode >= 500) {
    logger.error(
      `[${req.method}] ${req.originalUrl} - ${code}: ${message} - IP: ${req.ip} - Stack: ${err.stack}`,
    );
  } else {
    logger.warn(
      `[${req.method}] ${req.originalUrl} - ${code}: ${message} - IP: ${req.ip}`,
    );
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    },
  });
};

module.exports = errorHandler;
