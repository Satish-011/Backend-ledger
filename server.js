// server.js
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app'); // app.js se app import kiya[cite: 4]
const logger = require('./utils/logger'); // NAYA: Winston logger import kiya

const PORT = process.env.PORT || 3000;

// MongoDB Connection[cite: 4]
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        // NAYA: console.log ki jagah logger use kiya
        logger.info('MongoDB Database connected successfully!'); 
    })
    .catch((error) => {
        // NAYA: console.log ki jagah logger use kiya
        logger.error('MongoDB connection error:', error); 
    });

// Server Start[cite: 4]
app.listen(PORT, () => {
    // NAYA: console.log ki jagah logger use kiya
    logger.info(`Server is running on port ${PORT}`); 
});