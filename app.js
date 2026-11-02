// app.js
const express = require('express');
const helmet = require('helmet'); // NAYA: Security ke liye[cite: 3]
const cookieParser = require('cookie-parser'); // NAYA: Cookies read karne ke liye[cite: 3]

// Error Handling imports (NAYA ADD KIYA)
const { NotFoundError } = require('./utils/error');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 1. Security Headers (Sabse upar lagana best hota hai)[cite: 3]
app.use(helmet()); 

// 2. Parsers[cite: 3]
app.use(express.json());
app.use(cookieParser()); // Ab Express humari cookies read kar payega[cite: 3]

// 3. Routes Import[cite: 3]
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');

// 4. Routes Setup[cite: 3]
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
    res.send('Bank API is running securely!');
});

// 5. 404 Fallback Route (Agar user aisi API call kare jo exist nahi karti) (NAYA ADD KIYA)
app.all('*', (req, res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl} not found!`, "ROUTE_NOT_FOUND"));
});

// 6. Centralized Error Handler (Sabse aakhri middleware hona zaroori hai) (NAYA ADD KIYA)
app.use(errorHandler);

module.exports = app;