// routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const protect = require('../middlewares/auth.middleware');
const { generalLimiter } = require('../middlewares/rateLimiter'); // NAYA: Import kiya

// Sabhi routes par rate limit aur auth protection lagayenge
router.post('/transfer', generalLimiter, protect, transactionController.transferMoney);
router.post('/deposit', generalLimiter, protect, transactionController.depositMoney);
router.post('/withdraw', generalLimiter, protect, transactionController.withdrawMoney);
router.get('/history', generalLimiter, protect, transactionController.getHistory);

module.exports = router;