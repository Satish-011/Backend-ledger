// controllers/auth.controller.js
const User = require('../models/user.model');
const Account = require('../models/account.model'); // NAYA: Account model import kiya
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. User create karna
        const newUser = await User.create({ name, email, password });

        // 2. NAYA: User ke liye Bank Account create karna aur 5000 Rs daalna
        await Account.create({
            userId: newUser._id,
            balance: 5000 // Testing ke liye dummy paise
        });

        res.status(201).json({ 
            message: "User and Bank Account created successfully!", 
            user: newUser 
        });
    } catch (error) {
        res.status(400).json({ message: "Failed to create account", error: error.message });
    }
};

// Login function waise ka waisa hi rahega
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).json({ message: "User not found!" });

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) return res.status(400).json({ message: "Galat password!" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ message: "Login successful!", token: token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { register, login };