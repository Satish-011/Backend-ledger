// controllers/auth.controller.js
const User = require('../models/user.model');
const Account = require('../models/account.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailQueue = require('../utils/emailQueue'); // NAYA: BullMQ Queue
const redis = require('../utils/redisClient');     // NAYA: Redis Client

// ==========================================
// 1. REGISTER (Background Email)
// ==========================================
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = await User.create({ name, email, password });

        await Account.create({
            userId: newUser._id,
            balance: 5000 
        });

        const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
                <h2 style="color: #2b6cb0;">Welcome to My Bank API! 🏦</h2>
                <p>Hello <b>${name}</b>,</p>
                <p>Aapka bank account successfully open ho gaya hai with a bonus of ₹5000!</p>
            </div>
        `;

        // NAYA: Email ko background queue mein daal diya. API turant response degi!
        await emailQueue.add('send-welcome-email', {
            email: newUser.email,
            subject: 'Account Created Successfully - Welcome to Our Bank!',
            html: htmlTemplate
        });

        res.status(201).json({ 
            message: "User account created! Welcome email queued in background.", 
            user: { _id: newUser._id, name: newUser.name, email: newUser.email } 
        });
    } catch (error) {
        res.status(400).json({ message: "Failed to create account", error: error.message });
    }
};

// ==========================================
// 2. LOGIN USER (Same as before)
// ==========================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).json({ message: "User not found!" });

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) return res.status(400).json({ message: "Galat password!" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production' 
        });

        res.status(200).json({ message: "Login successful!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ==========================================
// 3. LOGOUT (Redis Caching for Blacklist)
// ==========================================
const logout = async (req, res) => {
    try {
        const token = req.cookies.jwt;

        if (token) {
            // NAYA: Token ko Redis mein save karna, 86400 seconds (1 day) ki expiry ke sath
            // Syntax: setex(key, seconds, value)
            await redis.setex(`blacklist_token:${token}`, 86400, 'blocked');
        }

        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0)
        });

        res.status(200).json({ message: "Logout successful! Token cached in Redis Blacklist." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { register, login, logout };