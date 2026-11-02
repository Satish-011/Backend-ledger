// routes/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const protect = require("../middlewares/auth.middleware"); // Apna bouncer import kiya

// GET request on /profile, par pehle protect chalega!
router.get("/profile", protect, userController.getProfile);

module.exports = router;
