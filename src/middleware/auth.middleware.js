const userModel = require("../models/user.model");
const {
  UnauthorizedError,
  ForbiddenError,
  getAuthToken,
  verifyAuthToken,
} = require("../utils");

const authMiddleware = async (req, res, next) => {
  const token = getAuthToken(req);

  if (!token) {
    return next(new UnauthorizedError("Unauthorized: No token provided", "TOKEN_MISSING"));
  }

  try {
    const decoded = verifyAuthToken(token);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return next(new UnauthorizedError("Unauthorized: User not found", "USER_NOT_FOUND"));
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Unauthorized: Token has expired", "TOKEN_EXPIRED"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Unauthorized: Invalid token", "TOKEN_INVALID"));
    }
    return next(error);
  }
};

const authsystemUserMiddleware = async (req, res, next) => {
  const token = getAuthToken(req);

  if (!token) {
    return next(new UnauthorizedError("Unauthorized: No token provided", "TOKEN_MISSING"));
  }

  try {
    const decoded = verifyAuthToken(token);
    const user = await userModel.findById(decoded.id).select("+systemUser");

    if (!user) {
      return next(new UnauthorizedError("Unauthorized: User not found", "USER_NOT_FOUND"));
    }

    if (!user.systemUser) {
      return next(
        new ForbiddenError("Forbidden: User is not a system user", "FORBIDDEN_NOT_SYSTEM_USER"),
      );
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Unauthorized: Token has expired", "TOKEN_EXPIRED"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Unauthorized: Invalid token", "TOKEN_INVALID"));
    }
    return next(error);
  }
};

module.exports = { authMiddleware, authsystemUserMiddleware };
