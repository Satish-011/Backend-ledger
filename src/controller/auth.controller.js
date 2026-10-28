const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { queueRegistrationEmail } = require("../queues/email.queue");
const {
  ConflictError,
  BadRequestError,
  InternalServerError,
} = require("../errors");

const registerController = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    if (!process.env.JWT_SECRET) {
      throw new InternalServerError("Server configuration error", "CONFIG_ERROR");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ConflictError("User already exists", "USER_ALREADY_EXISTS");
    }

    const newUser = await User.create({ email, name, password });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("token", token);

    await queueRegistrationEmail(newUser.email, newUser.name);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!process.env.JWT_SECRET) {
      throw new InternalServerError("Server configuration error", "CONFIG_ERROR");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new BadRequestError("Invalid credentials", "INVALID_CREDENTIALS");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new BadRequestError("Invalid credentials", "INVALID_CREDENTIALS");
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("token", token);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerController, loginController };
