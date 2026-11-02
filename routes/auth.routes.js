// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authLimiter } = require("../middlewares/rateLimiter"); // NAYA: Import kiya

// NAYA: Har auth route se pehle authLimiter laga diya
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/logout", authController.logout); // Logout par strict limit ki zaroorat nahi hai

module.exports = router;
