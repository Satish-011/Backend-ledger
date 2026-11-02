// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Pehle se bana hua register route
router.post('/register', authController.register);

// NAYA: Login route
router.post('/login', authController.login);

module.exports = router;
