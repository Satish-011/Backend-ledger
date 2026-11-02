// controllers/auth.controller.js
const User = require('../models/user.model'); // Apna model import kiya

const register = async (req, res) => {
    try {
        // 1. Client ne jo data bheja hai, usko nikalna
        const { name, email, password } = req.body;

        // 2. Database mein naya user create karna
        const newUser = await User.create({
            name: name,
            email: email,
            password: password
        });

        // 3. Success response bhejna
        res.status(201).json({
            message: "User account created successfully!",
            user: newUser
        });

    } catch (error) {
        // Agar email pehle se exist karta hai ya koi aur error aaye
        res.status(400).json({
            message: "Failed to create account",
            error: error.message
        });
    }
};

module.exports = { register };