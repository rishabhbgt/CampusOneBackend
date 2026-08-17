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

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["student", "faculty", "admin"],
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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);