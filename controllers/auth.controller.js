const User = require('../models/user.model');
const Account = require('../models/account.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailQueue = require('../utils/emailQueue');
const redis = require('../utils/redisClient');
const { BadRequestError, UnauthorizedError, ConflictError, InternalServerError } = require('../utils/error');

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) throw new ConflictError("Email already in use!", "EMAIL_EXISTS");

        const newUser = await User.create({ name, email, password });

        await Account.create({ userId: newUser._id, balance: 5000 });

        const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
                <h2 style="color: #2b6cb0;">Welcome to My Bank API! 🏦</h2>
                <p>Hello <b>${name}</b>,</p>
                <p>Aapka bank account successfully open ho gaya hai with a bonus of ₹5000!</p>
            </div>
        `;

        await emailQueue.add('send-welcome-email', {
            email: newUser.email,
            subject: 'Account Created Successfully - Welcome to Our Bank!',
            html: htmlTemplate
        });

        res.status(201).json({ 
            success: true,
            message: "User account created! Welcome email queued.", 
            user: { _id: newUser._id, name: newUser.name, email: newUser.email } 
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // .select('+password') is required because we set select: false in the model
        const user = await User.findOne({ email }).select('+password');
        if (!user) throw new BadRequestError("User not found!", "USER_NOT_FOUND");

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) throw new UnauthorizedError("Galat password!", "INVALID_CREDENTIALS");

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production' 
        });

        res.status(200).json({ success: true, message: "Login successful!" });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (token) {
            const decoded = jwt.decode(token);
            if (decoded && decoded.exp) {
                const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
                if (timeLeft > 0) {
                    await redis.setex(`blacklist_token:${token}`, timeLeft, 'blocked');
                }
            }
        }
        res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
        res.status(200).json({ success: true, message: "Logout successful!" });
    } catch (error) {
        next(new InternalServerError(error.message));
    }
};

module.exports = { register, login, logout };