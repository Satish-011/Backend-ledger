/**
 * Centralized error-handling middleware.
 * Must be registered AFTER all routes in app.js.
 *
 * Any controller can call next(error) and this will catch it.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Internal server error";

  return res.status(statusCode).json({ message });
};

module.exports = errorHandler;

