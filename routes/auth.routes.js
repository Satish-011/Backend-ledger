// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// POST request on /register
router.post("/register", authController.register);

module.exports = router;
