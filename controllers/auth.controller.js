// controllers/auth.controller.js
const User = require('../models/user.model');
const bcrypt = require('bcryptjs'); // Password check karne ke liye
const jwt = require('jsonwebtoken'); // Ticket (token) banane ke liye

// Pehle se banaya hua register function
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = await User.create({ name, email, password });
        res.status(201).json({ message: "User account created successfully!", user: newUser });
    } catch (error) {
        res.status(400).json({ message: "Failed to create account", error: error.message });
    }
};

// NAYA: Login Function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check karna ki is email se koi user hai ya nahi
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: "User not found! Pehle register karein." });
        }

        // 2. Password check karna (Bheja gaya password VS Database ka hashed password)
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Galat password! Wapas try karein." });
        }

        // 3. Agar password sahi hai, toh JWT (Ticket) banayenge
        // Ye ticket 1 din (1d) tak valid rahega
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // 4. User ko success message aur token bhej dena
        res.status(200).json({
            message: "Login successful!",
            token: token
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Dono functions ko export karna
module.exports = { register, login };
