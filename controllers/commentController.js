const Comment = require("../models/Comment");
const Complaint = require("../models/Complaint");

const canAccessComplaint = (complaint, user) => {

    if (!complaint || !user) {
        return false;
    }

    if (user.role === "admin") {
        return true;
    }

    if (user.role === "student") {

        return (
            complaint.createdBy?.toString() ===
            user.id
        );

    }

    if (user.role === "faculty") {

        return (
            complaint.assignedTo &&
            complaint.assignedTo.toString() ===
            user.id
        );

    }


    return false;
};

const addComment = async (req, res) => {

    try {

        const { message } = req.body;

        if (!message || !message.trim()) {

            return res.status(400).json({

                message:
                    "Comment message is required",

            });

        }

        const complaint =
            await Complaint.findById(
                req.params.id
            );


        if (!complaint) {

            return res.status(404).json({

                message:
                    "Complaint not found",

            });

        }

        if (
            !canAccessComplaint(
                complaint,
                req.user
            )
        ) {

            return res.status(403).json({

                message:
                    "You are not authorized to comment on this complaint",

            });

        }

        const comment =
            await Comment.create({

                complaint:
                    complaint._id,

                user:
                    req.user.id,

                message:
                    message.trim(),

            });

        await comment.populate(
            "user",
            "fullName role"
        );


        res.status(201).json({

            message:
                "Comment Added Successfully",

            comment,

        });


    } catch (error) {

        console.error(
            "Add Comment Error:",
            error
        );


        res.status(500).json({

            message:
                error.message,

        });

    }

};

const getComments = async (req, res) => {

    try {


        const complaint =
            await Complaint.findById(
                req.params.id
            );


        if (!complaint) {

            return res.status(404).json({

                message:
                    "Complaint not found",

            });

        }

        if (
            !canAccessComplaint(
                complaint,
                req.user
            )
        ) {

            return res.status(403).json({

                message:
                    "You are not authorized to view these comments",

            });

        }

        const comments =
            await Comment.find({

                complaint:
                    req.params.id,

            })
            .populate(
                "user",
                "fullName role"
            )
            .sort({
                createdAt: 1,
            });


        res.status(200).json({

            comments,

        });


    } catch (error) {

        console.error(
            "Get Comments Error:",
            error
        );


        res.status(500).json({

            message:
                error.message,

        });

    }

};

module.exports = {

    addComment,
    getComments,

};