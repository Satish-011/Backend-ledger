// routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const protect = require('../middlewares/auth.middleware');

// Sabhi routes logged-in user ke liye protect kiye gaye hain
router.post('/transfer', protect, transactionController.transferMoney);
router.post('/deposit', protect, transactionController.depositMoney);
router.get('/history', protect, transactionController.getHistory);

module.exports = router;