// controllers/auth.controller.js
const User = require("../models/user.model");
const Account = require("../models/account.model");
const BlacklistedToken = require("../models/blacklistedToken.model");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. User create karna
    const newUser = await User.create({ name, email, password });

    // 2. NAYA: User ke liye Bank Account create karna aur 5000 Rs daalna
    await Account.create({
      userId: newUser._id,
      balance: 5000, // Testing ke liye dummy paise
    });

    res.status(201).json({
      message: "User and Bank Account created successfully!",
      user: newUser,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create account", error: error.message });
  }
};

// Login function waise ka waisa hi rahega
// controllers/auth.controller.js (sirf login function update hoga)

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ message: "User not found!" });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res.status(400).json({ message: "Galat password!" });

    // Token banaya (1 din ke liye)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // NAYA: Cookie ke options set karna
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 din baad expire
      httpOnly: true, // JS ise read nahi kar payega (XSS Protection)
      secure: process.env.NODE_ENV === "production", // Production me sirf HTTPS pe chalega
    };

    // NAYA: Response mein cookie set karna
    res.cookie("jwt", token, cookieOptions);

    // NAYA: JSON mein ab token nahi bhejenge
    res.status(200).json({
      message: "Login successful!",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    // 1. Current token nikalna (jo user ne bheja hai)
    const token = req.cookies.jwt;

    if (token) {
      // 2. Token ko database mein "Blocked" list mein daal dena
      await BlacklistedToken.create({ token: token });
    }

    // 3. Browser/Postman se bhi cookie clear kar dena
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logout aur Token Blacklist successful!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, login, logout };
