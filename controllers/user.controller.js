// controllers/user.controller.js
const User = require('../models/user.model');

const getProfile = async (req, res) => {
    try {
        // req.userId hume us Bouncer (middleware) ne diya hai!
        // .select('-password') ka matlab hai ki user data laao par password mat bhejna
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile data fetched successfully",
            user: user
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getProfile };