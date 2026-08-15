const User = require("../models/User");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
    try {

        const {
            fullName,
            email,
            phone,
            password,
            role,
        } = req.body;

        if (
            !fullName ||
            !email ||
            !phone ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                message: "Enter a valid 10-digit mobile number",
            });
        }

        if (
            !["admin", "faculty"].includes(role)
        ) {
            return res.status(400).json({
                message:
                    "Only Admin or Faculty accounts can be created here",
            });
        }

        const existingUser =
            await User.findOne({ email });


        if (existingUser) {
            return res.status(400).json({
                message:
                    "User already exists",
            });
        }

        const existingPhone =
            await User.findOne({ phone });

        if (existingPhone) {
            return res.status(400).json({
                message: "Mobile number already registered",
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
                email,
                phone, 
                phoneVerified: false,
                password: hashedPassword,
                role,
            });


        res.status(201).json({
            message:
                `${role === "faculty" ? "Faculty" : "Admin"} account created successfully`,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked,
            },
        });


    } catch (error) {

        console.error(
            "Create User Error:",
            error
        );

        res.status(500).json({
            message: error.message,
        });

    }
};

const getAllUsers = async (req, res) => {
    try {

        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            users,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const blockUser = async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({
                message: "You cannot block yourself",
            });
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                isBlocked: true,
            },
            {
                new: true,
            }
        ).select("-password");

        res.status(200).json({
            message: "User Blocked",
            user,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const unblockUser = async (req, res) => {
    
    try {

        if (req.user.id === req.params.id) {
            return res.status(400).json({
                message: "You cannot unblock yourself",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                isBlocked: false,
            },
            {
                new: true,
            }
        ).select("-password");

        res.status(200).json({
            message: "User Unblocked",
            user,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const deleteUser = async (req, res) => {
    try {

        if (req.user.id === req.params.id) {
            return res.status(400).json({
                message: "You cannot delete yourself",
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "User Deleted",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const changeRole = async (req, res) => {
    try {

        const { role } = req.body;

        if (req.user.id === req.params.id) {
            return res.status(400).json({
            message: "You cannot change your own role",
        });
}

        if (!["student", "faculty", "admin"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                role,
            },
            {
                new: true,
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "Role Updated Successfully",
            user,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

module.exports = {
    createUser,
    getAllUsers,
    blockUser,
    unblockUser,
    deleteUser,
    changeRole,
};