// app.js
const express = require('express');
const app = express();

// Middleware: Ye aage POST request (Registration) mein JSON data read karne ke kaam aayega
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
    res.send('Bank API is running from app.js!');
});

// App instance ko export karna
module.exports = app;