const User = require('../models/user.model');
const Account = require('../models/account.model'); 

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        const account = await Account.findOne({ userId: req.userId });

        res.status(200).json({
            message: "Profile data fetched successfully",
            user: user,
            account: account
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getProfile };