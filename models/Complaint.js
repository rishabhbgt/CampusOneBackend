const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            enum: [
                "Hostel",
                "Library",
                "Mess",
                "Canteen",
                "Classroom",
                "Other",
            ],
            required: true,
        },

        image: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "In Progress",
                "Resolved",
            ],
            default: "Pending",
        },

        priority: {
            type: String,
            enum: [
                "Low",
                "Medium",
                "High",
            ],
            default: "Medium",
        },

        dueDate: {
            type: Date,
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },

                name: String,

                role: String,

                message: String,

                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        history: [
            {
                action: {
                    type: String,
                    enum: [
                        "SUBMITTED",
                        "ASSIGNED",
                        "REASSIGNED",
                        "STATUS_UPDATED",
                        "PRIORITY_UPDATED",
                        "DUE_DATE_UPDATED",
                        "UNASSIGNED",
                    ],
                    required: true,
                },

                status: {
                    type: String,
                    enum: [
                        "Pending",
                        "In Progress",
                        "Resolved",
                    ],
                },

                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },

                changedByRole: {
                    type: String,
                    enum: [
                        "student",
                        "faculty",
                        "admin",
                    ],
                },

                message: {
                    type: String,
                    required: true,
                },

                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

module.exports =
    mongoose.model(
        "Complaint",
        complaintSchema
    );