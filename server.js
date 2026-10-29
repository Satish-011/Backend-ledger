// server.js
const express = require('express');
const app = express();

const PORT = 3000;

// Ek simple test route check karne ke liye ki server chal raha hai ya nahi
app.get('/', (req, res) => {
    res.send('Bank API is running!');
});

// Server ko port 3000 par start karna
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});