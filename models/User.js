const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        phoneVerified: {
            type: Boolean,
            default: false,
        },

        otpCode: {
            type: String,
            default: null,
        },

        otpExpires: {
            type: Date,
            default: null,
        },

        passwordResetOtp: {
            type: String,
            default: null,
        },

        passwordResetOtpExpires: {
            type: Date,
            default: null,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        role: {
            type: String,
            enum: [
                "student",
                "faculty",
                "admin",
            ],
            default: "student",
        },

        isBlocked: {
            type: Boolean,
            default: false,
        },

        passwordResetToken: {
            type: String,
            default: null,
        },

        passwordResetExpires: {
            type: Date,
            default: null,
        },

        passwordResetOtpHash: {
            type: String,
            default: null,
        },

        passwordResetOtpExpires: {
            type: Date,
            default: null,
        },

        passwordResetOtpAttempts: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports =
    mongoose.model(
        "User",
        userSchema
    );