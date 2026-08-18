const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const validatePassword = require("../utils/passwordValidator");

const signup = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            password,
        } = req.body;

        if (!fullName || !email || !phone || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const passwordErrors = validatePassword(password);

        if (passwordErrors.length > 0) {
            return res.status(400).json({
                message: passwordErrors.join(". "),
            });
        }
        
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                message: "Enter a valid 10-digit mobile number",
            });
        }


        const existingEmail = await User.findOne({
            email: email.toLowerCase(),
        });

        if (existingEmail) {
            return res.status(400).json({
                message: "Email already registered",
            });
        }

        const existingPhone = await User.findOne({
            phone,
        });

        if (existingPhone) {
            return res.status(400).json({
                message: "Mobile number already registered",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            role: "student",
        });

        return res.status(201).json({
            message: "Signup successful.",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Signup Error:", error);

        return res.status(500).json({
            message: "Signup failed",
        });
    }
};

const login = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Credentials",
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                message:
                    "Your account has been blocked by the admin.",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return res.status(200).json({
            message: "Login Successful",

            token,

            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            message: "Login failed",
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "Password is required",
            });
        }

        const passwordErrors = validatePassword(password);

        if (passwordErrors.length > 0) {
            return res.status(400).json({
                message: passwordErrors.join(". "),
            });
        }

        const resetTokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            passwordResetToken: resetTokenHash,
            passwordResetExpires: {
                $gt: Date.now(),
            },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset link",
            });
        }

        user.password = await bcrypt.hash(
            password,
            10
        );

        user.passwordResetToken = null;
        user.passwordResetExpires = null;

        await user.save();

        return res.status(200).json({
            message: "Password reset successful",
        });

    } catch (error) {
        console.error("Reset Password Error:", error);

        return res.status(500).json({
            message: "Failed to reset password",
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(200).json({
                message:
                    "If this email is registered, a reset link has been sent.",
            });
        }

        const resetToken =
            crypto.randomBytes(32).toString("hex");

        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.passwordResetToken = resetTokenHash;

        user.passwordResetExpires =
            Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink =
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const html = `
            <h2>Reset Your CampusOne Password</h2>
            <p>Click the button below to reset your password.</p>
            <p>
                <a href="${resetLink}">
                    Reset Password
                </a>
            </p>
            <p>This link will expire in 15 minutes.</p>
        `;

        await sendEmail(
            user.email,
            "CampusOne | Reset Password",
            html
        );

        return res.status(200).json({
            message:
                "If this email is registered, a reset link has been sent.",
        });

    } catch (error) {
        console.error(
            "Forgot Password Error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to process password reset request",
        });
    }
};

module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
};