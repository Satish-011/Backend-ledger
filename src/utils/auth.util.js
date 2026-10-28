const jwt = require("jsonwebtoken");
const { InternalServerError } = require("../errors");

const getAuthToken = (req) => {
  return req.cookies?.token || req.headers.authorization?.split(" ")[1];
};

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new InternalServerError("Server configuration error", "CONFIG_ERROR");
  }

  return process.env.JWT_SECRET;
};

const createAuthToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), { expiresIn: "1h" });
};

const verifyAuthToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token);
};

module.exports = {
  getAuthToken,
  createAuthToken,
  verifyAuthToken,
  setAuthCookie,
};
