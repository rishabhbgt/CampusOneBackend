const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");


const signup = async (req, res) => {

    try {

        const {
            fullName,
            email,
            phone,
            password,
        } = req.body;


        if (
            !fullName ||
            !email ||
            !phone ||
            !password
        ) {

            return res.status(400).json({
                message:
                    "All fields are required",
            });

        }


        if (
            !/^[0-9]{10}$/.test(phone)
        ) {

            return res.status(400).json({
                message:
                    "Enter a valid 10-digit mobile number",
            });

        }


        const existingEmail =
            await User.findOne({
                email: email.toLowerCase(),
            });


        if (existingEmail) {

            return res.status(400).json({
                message:
                    "Email already registered",
            });

        }


        const existingPhone =
            await User.findOne({
                phone,
            });


        if (existingPhone) {

            return res.status(400).json({
                message:
                    "Mobile number already registered",
            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const user =
            await User.create({

                fullName,

                email:
                    email.toLowerCase(),

                phone,

                phoneVerified:
                    false,

                password:
                    hashedPassword,

                role:
                    "student",

            });


        try {

            const otpCode =
                Math.floor(
                    100000 + Math.random() * 900000
                ).toString();

            user.otpCode = otpCode;

            user.otpExpires =
                Date.now() + 5 * 60 * 1000;

            await user.save();

            console.log(
                `OTP for ${phone}: ${otpCode}`
            );

        } catch (otpError) {

            await User.findByIdAndDelete(
                user._id
            );

            console.error(
                "OTP Send Error:",
                otpError
            );

            return res.status(500).json({
                message:
                    "Unable to send OTP. Please try again.",
            });

        }


        res.status(201).json({

            message:
                "Signup successful. Please verify your mobile number.",

            user: {

                id:
                    user._id,

                fullName:
                    user.fullName,

                email:
                    user.email,

                phone:
                    user.phone,

                role:
                    user.role,

                phoneVerified:
                    user.phoneVerified,

            },

        });


    } catch (error) {

        console.error(
            "Signup Error:",
            error
        );


        res.status(500).json({
            message:
                "Signup failed",
        });

    }

};


const verifyPhone = async (req, res) => {

    try {

        const {
            phone,
            code,
        } = req.body;

        if (!phone || !code) {
            return res.status(400).json({
                message:
                    "Phone number and OTP are required",
            });
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                message:
                    "Enter a valid 10-digit mobile number",
            });
        }

        if (!/^[0-9]{6}$/.test(code)) {
            return res.status(400).json({
                message:
                    "Enter a valid 6-digit OTP",
            });
        }

        const user =
            await User.findOne({
                phone,
            });

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found",
            });
        }

        if (user.phoneVerified) {
            return res.status(400).json({
                message:
                    "Mobile number is already verified",
            });
        }

        if (!user.otpCode || !user.otpExpires) {
            return res.status(400).json({
                message:
                    "OTP not found. Please signup again.",
            });
        }

        if (
            Date.now() > user.otpExpires.getTime()
        ) {

            user.otpCode = null;
            user.otpExpires = null;

            await user.save();

            return res.status(400).json({
                message:
                    "OTP has expired. Please signup again.",
            });
        }

        if (user.otpCode !== code) {
            return res.status(400).json({
                message:
                    "Invalid OTP",
            });
        }

        user.phoneVerified = true;

        user.otpCode = null;
        user.otpExpires = null;

        await user.save();

        return res.status(200).json({
            message:
                "Mobile number verified successfully",
        });

    } catch (error) {

        console.error(
            "Phone Verification Error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to verify mobile number",
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

        if (password.length < 6) {
            return res.status(400).json({
                message:
                    "Password must be at least 6 characters",
            });
        }

        const resetTokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

        const user =
            await User.findOne({
                passwordResetToken:
                    resetTokenHash,
                passwordResetExpires: {
                    $gt: Date.now(),
                },
            });

        if (!user) {
            return res.status(400).json({
                message:
                    "Invalid or expired reset link",
            });
        }

        user.password =
            await bcrypt.hash(
                password,
                10
            );

        user.passwordResetToken = null;
        user.passwordResetExpires = null;

        await user.save();

        return res.status(200).json({
            message:
                "Password reset successful",
        });

    } catch (error) {

        console.error(
            "Reset Password Error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to reset password",
        });

    }

};

const login = async (req, res) => {

    try {

        const {
            email,
            password,
        } = req.body;


        if (
            !email ||
            !password
        ) {

            return res.status(400).json({
                message:
                    "All fields are required",
            });

        }


        const user =
            await User.findOne({
                email:
                    email.toLowerCase(),
            });


        if (!user) {

            return res.status(404).json({
                message:
                    "User not found",
            });

        }


        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(401).json({
                message:
                    "Invalid Credentials",
            });

        }


        if (user.isBlocked) {

            return res.status(403).json({
                message:
                    "Your account has been blocked by the admin.",
            });

        }


        const token =
            jwt.sign(
                {
                    id:
                        user._id,

                    role:
                        user.role,
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "7d",
                }
            );


        return res.status(200).json({

            message:
                "Login Successful",

            token,

            user: {

                id:
                    user._id,

                fullName:
                    user.fullName,

                email:
                    user.email,

                phone:
                    user.phone,

                role:
                    user.role,

                phoneVerified:
                    user.phoneVerified,

            },

        });


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        return res.status(500).json({
            message:
                "Login failed",
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

        const user =
            await User.findOne({
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

        const resetTokenHash =
            crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");

        user.passwordResetToken =
            resetTokenHash;

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
const forgotPasswordByPhone = async (req, res) => {

    try {

        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                message: "Mobile number is required",
            });
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                message: "Enter a valid 10-digit mobile number",
            });
        }

        const user = await User.findOne({
            phone,
        });

        if (!user) {
            return res.status(200).json({
                message:
                    "If this mobile number is registered, an OTP has been generated.",
            });
        }

        const otp =
            Math.floor(
                100000 + Math.random() * 900000
            ).toString();

        user.passwordResetOtp = otp;

        user.passwordResetOtpExpires =
            Date.now() + 5 * 60 * 1000;

        await user.save();

        console.log(
            `Password Reset OTP for ${phone}: ${otp}`
        );

        return res.status(200).json({
            message:
                "If this mobile number is registered, an OTP has been generated.",
        });

    } catch (error) {

        console.error(
            "Forgot Password Phone Error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to process request",
        });

    }

};

const verifyPasswordResetOtp = async (req, res) => {

    try {

        const {
            phone,
            code,
        } = req.body;

        if (!phone || !code) {
            return res.status(400).json({
                message: "Mobile number and OTP are required",
            });
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                message: "Enter a valid 10-digit mobile number",
            });
        }

        if (!/^[0-9]{6}$/.test(code)) {
            return res.status(400).json({
                message: "Enter a valid 6-digit OTP",
            });
        }

        const user = await User.findOne({
            phone,
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        if (
            !user.passwordResetOtp ||
            !user.passwordResetOtpExpires
        ) {
            return res.status(400).json({
                message: "OTP not found. Please request a new OTP.",
            });
        }

        if (
            Date.now() >
            user.passwordResetOtpExpires.getTime()
        ) {

            user.passwordResetOtp = null;
            user.passwordResetOtpExpires = null;

            await user.save();

            return res.status(400).json({
                message: "OTP has expired. Please request a new OTP.",
            });
        }

        if (user.passwordResetOtp !== code) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        return res.status(200).json({
            message: "OTP verified successfully",
        });

    } catch (error) {

        console.error(
            "Verify Password Reset OTP Error:",
            error
        );

        return res.status(500).json({
            message: "Failed to verify OTP",
        });

    }

};

const resetPasswordByPhone = async (req, res) => {

    try {

        const {
            phone,
            code,
            password,
        } = req.body;

        if (!phone || !code || !password) {
            return res.status(400).json({
                message:
                    "Mobile number, OTP and password are required",
            });
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                message:
                    "Enter a valid 10-digit mobile number",
            });
        }

        if (!/^[0-9]{6}$/.test(code)) {
            return res.status(400).json({
                message:
                    "Enter a valid 6-digit OTP",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message:
                    "Password must be at least 6 characters",
            });
        }

        const user = await User.findOne({
            phone,
        });

        if (!user) {
            return res.status(400).json({
                message:
                    "Invalid OTP",
            });
        }

        if (
            !user.passwordResetOtp ||
            !user.passwordResetOtpExpires
        ) {
            return res.status(400).json({
                message:
                    "OTP not found. Please request a new OTP.",
            });
        }

        if (
            Date.now() >
            user.passwordResetOtpExpires.getTime()
        ) {

            user.passwordResetOtp = null;
            user.passwordResetOtpExpires = null;

            await user.save();

            return res.status(400).json({
                message:
                    "OTP has expired. Please request a new OTP.",
            });
        }

        if (user.passwordResetOtp !== code) {
            return res.status(400).json({
                message:
                    "Invalid OTP",
            });
        }

        user.password =
            await bcrypt.hash(
                password,
                10
            );

        user.passwordResetOtp = null;
        user.passwordResetOtpExpires = null;

        await user.save();

        return res.status(200).json({
            message:
                "Password reset successful",
        });

    } catch (error) {

        console.error(
            "Reset Password By Phone Error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to reset password",
        });

    }

};

module.exports = {
    signup,
    login,
    verifyPhone,
    forgotPassword,
    resetPassword,
    forgotPasswordByPhone,
    verifyPasswordResetOtp,
    resetPasswordByPhone,
};