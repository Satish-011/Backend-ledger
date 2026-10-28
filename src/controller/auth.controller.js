const User = require("../models/user.model");
const { queueRegistrationEmail } = require("../queues/email.queue");
const {
  ConflictError,
  BadRequestError,
  createAuthToken,
  setAuthCookie,
} = require("../utils");

const registerController = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ConflictError("User already exists", "USER_ALREADY_EXISTS");
    }

    const newUser = await User.create({ email, name, password });

    const token = createAuthToken(newUser._id);
    setAuthCookie(res, token);

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

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new BadRequestError("Invalid credentials", "INVALID_CREDENTIALS");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new BadRequestError("Invalid credentials", "INVALID_CREDENTIALS");
    }

    const token = createAuthToken(user._id);
    setAuthCookie(res, token);

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
