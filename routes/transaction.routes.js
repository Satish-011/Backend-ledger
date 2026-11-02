// routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const protect = require('../middlewares/auth.middleware');

// Is API ko sirf logged-in user hi chala sakta hai (protect middleware)
router.post('/transfer', protect, transactionController.transferMoney);

module.exports = router;