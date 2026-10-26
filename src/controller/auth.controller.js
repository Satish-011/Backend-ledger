const User = require("../models/user.model");

const registerController = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const newUser = await User.create({
      email,
      name,
      password,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { registerController };
