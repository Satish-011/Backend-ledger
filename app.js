// app.js
const express = require('express');
const helmet = require('helmet'); // NAYA: Security ke liye
const cookieParser = require('cookie-parser'); // NAYA: Cookies read karne ke liye

const app = express();

// 1. Security Headers (Sabse upar lagana best hota hai)
app.use(helmet()); 

// 2. Parsers
app.use(express.json());
app.use(cookieParser()); // Ab Express humari cookies read kar payega

// 3. Routes Import
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');

// 4. Routes Setup
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
    res.send('Bank API is running securely!');
});

module.exports = app;