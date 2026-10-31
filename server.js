// server.js
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app'); // app.js se app import kiya

const PORT = 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Database connected successfully!');
    })
    .catch((error) => {
        console.log('MongoDB connection error:', error);
    });

// Server Start
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});