const User = require("../models/User");
const Notification = require("../models/Notification");
const Complaint = require("../models/Complaint");
const sendEmail = require("../utils/sendEmail");
const statusUpdateTemplate = require("../templates/statusUpdateTemplate");

const createComplaint = async (req, res) => {
    try {

        console.log("BODY =>", req.body);
        console.log("FILE =>", req.file);

        const { title, description, category } = req.body;
        const image = req.file ? req.file.path : "";

        const complaint = await Complaint.create({
            title,
            description,
            category,
            image,
            createdBy: req.user.id,
        });

        const admins = await User.find({
                role: "admin",
            });
            
        const io = req.app.get("io");
        const users = req.app.get("users");

            for (const admin of admins) {

                await Notification.create({
                    user: admin._id,
                    complaint: complaint._id,
                    message: `New complaint submitted: ${complaint.title}`,
                });

                const socketId = users[admin._id.toString()];

                if(socketId){
                    io.to(socketId).emit("newNotification", {
                        message: `New complaint submitted: ${complaint.title}`,
                    });
                }

            }

        res.status(201).json({
            message: "Complaint Created Successfully",
            complaint,
        });

    } catch (error) {

        console.error("Create Complaint Error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
};

const getMyComplaints = async (req, res) => {
    try {

        const complaints = await Complaint.find({
            createdBy: req.user.id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            complaints,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const getComplaintById = async (req, res) => {
    try {

        const complaint = await Complaint.findById(req.params.id)
            .populate("createdBy", "fullName email")
            .populate("assignedTo", "fullName email");

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found",
            });
        }

        res.status(200).json({
            complaint,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const getAllComplaints = async (req, res) => {
    try {

        const complaints = await Complaint.find()
            .populate("createdBy", "fullName email")
            .populate("assignedTo", "fullName email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            complaints,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const updateComplaintStatus = async (req, res) => {
    try {

        const {
            status,
            priority,
            dueDate,
            assignedTo,
        } = req.body;

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            {
                status,
                priority,
                dueDate,
                assignedTo,
            },
            {
                new: true,
            }
        ).populate("createdBy", "fullName email");

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found",
            });
        }

        try {

            const html = statusUpdateTemplate(
                complaint.createdBy.fullName,
                complaint.title,
                complaint.status,
                complaint.priority
            );

            // Save notification in DB
            const notification = await Notification.create({
                user: complaint.createdBy._id,
                complaint: complaint._id,
                message: `Your complaint "${complaint.title}" status changed to ${complaint.status}.`,
            });

            // Socket.IO
            const io = req.app.get("io");
            const users = req.app.get("users");

            const socketId = users[complaint.createdBy._id.toString()];

            if (socketId) {
                io.to(socketId).emit("newNotification", {
                    message: notification.message,
                });
            }

            // Email
            await sendEmail(
                complaint.createdBy.email,
                "CampusOne | Complaint Status Updated",
                html
            );

        } catch (emailError) {

            console.log("Email Error:", emailError.message);

        }

        res.status(200).json({
            message: "Complaint Updated Successfully",
            complaint,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};
const editComplaint = async (req, res) => {
    try {


        const { title, description, category, removeImage } = req.body;

        const updateData = {
            title,
            description,
            category,
        };

        if (removeImage === "true") {
            updateData.image = "";
}


        if (req.file) {

            updateData.image = req.file.path;

        }
        else if (removeImage === "true") {

            updateData.image = "";

        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
            }
        );

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found",
            });
        }

        res.status(200).json({
            message: "Complaint Updated Successfully",
            complaint,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const deleteComplaint = async (req, res) => {
    try {

        const complaint = await Complaint.findByIdAndDelete(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found",
            });
        }

        res.status(200).json({
            message: "Complaint Deleted Successfully",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

module.exports = {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    updateComplaintStatus,
    getAllComplaints,
    editComplaint,
    deleteComplaint,
};