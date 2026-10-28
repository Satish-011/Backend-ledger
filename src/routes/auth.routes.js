const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate.middleware");
const { registerSchema, loginSchema } = require("../validations/auth.validation");
const authController = require("../controller/auth.controller");

router.post("/register", validate(registerSchema), authController.registerController);
router.post("/login", validate(loginSchema), authController.loginController);

module.exports = router;
