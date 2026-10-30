// server.js
require("dotenv").config(); // Ye line .env file se data load karti hai
const express = require("express");
const mongoose = require("mongoose"); // Mongoose import kiya

const app = express();
const PORT = 3000;

// MongoDB se connect karne ka ekdum basic aur simple code
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Database connected successfully!");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });

app.get("/", (req, res) => {
  res.send("Bank API is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
