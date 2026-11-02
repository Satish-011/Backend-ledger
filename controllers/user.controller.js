// controllers/user.controller.js
const User = require('../models/user.model');
const Account = require('../models/account.model'); // Account model import kiya

const getProfile = async (req, res) => {
    try {
        // 1. User ki details lana
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. User ka Bank Account (balance) lana
        const account = await Account.findOne({ userId: req.userId });

        // 3. Dono details sath mein bhej dena
        res.status(200).json({
            message: "Profile data fetched successfully",
            user: user,
            account: account // Balance yahan dikhega!
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getProfile };