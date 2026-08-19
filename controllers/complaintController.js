const mongoose = require("mongoose");

const User = require("../models/User");
const Notification = require("../models/Notification");
const Complaint = require("../models/Complaint");

const sendEmail = require("../utils/sendEmail");
const statusUpdateTemplate = require("../templates/statusUpdateTemplate");

const createComplaint = async (req, res) => {

    try {

        console.log("BODY =>", req.body);
        console.log("FILE =>", req.file);


        const {
            title,
            description,
            category,
        } = req.body;


        const image =
            req.file
                ? req.file.path
                : ""

        const complaint =
            await Complaint.create({

                title,

                description,

                category,

                image,

                createdBy:
                    req.user.id,

                history: [

                    {
                        action:
                            "SUBMITTED",

                        status:
                            "Pending",

                        changedBy:
                            req.user.id,

                        changedByRole:
                            req.user.role,

                        message:
                            "Complaint submitted",

                    },

                ],

            });

        const admins =
            await User.find({
                role: "admin",
            });


        const io =
            req.app.get("io");

        const users =
            req.app.get("users") || {};


        for (const admin of admins) {

            try {

                const notification =
                    await Notification.create({

                        user:
                            admin._id,

                        complaint:
                            complaint._id,

                        type:
                            "NEW_COMPLAINT",

                        message:
                            `New complaint submitted: "${complaint.title}"`,

                    });


                const socketId =
                    users[
                        admin._id.toString()
                    ];


                if (socketId && io) {

                    io.to(socketId).emit(
                        "newNotification",
                        {
                            message:
                                notification.message,
                        }
                    );

                }

            } catch (notificationError) {

                console.error(
                    "Admin Notification Error:",
                    notificationError
                );

            }

        }


        res.status(201).json({

            message:
                "Complaint Created Successfully",

            complaint,

        });


    } catch (error) {

        console.error(
            "Create Complaint Error:",
            error
        );


        res.status(500).json({

            message:
                error.message,

        });

    }

};

const getMyComplaints = async (req, res) => {

    try {

        const complaints = await Complaint.find({
            createdBy: req.user.id,
            isArchived: { $ne: true },
        }).sort({
            createdAt: -1,
        });


        res.status(200).json({

            complaints,

        });


    } catch (error) {

        console.error(
            "Get My Complaints Error:",
            error
        );


        res.status(500).json({

            message:
                error.message,

        });

    }

};

const getAssignedComplaints = async (req, res) => {

    try {

        const complaints = await Complaint.find({
                assignedTo: req.user.id,
                isArchived: { $ne: true },
            })
                .populate(
                    "createdBy",
                    "fullName email"
                )
                .populate(
                    "assignedTo",
                    "fullName email"
                )
                .sort({
                    createdAt: -1,
                });


        res.status(200).json({

            complaints,

        });


    } catch (error) {

        console.error(
            "Get Assigned Complaints Error:",
            error
        );


        res.status(500).json({

            message:
                error.message,

        });

    }

};

const getComplaintById = async (req, res) => {

    try {

        const complaint =
            await Complaint.findById(
                req.params.id
            )
            .populate(
                "createdBy",
                "fullName email"
            )
            .populate(
                "assignedTo",
                "fullName email"
            )
            .populate(
                "history.changedBy",
                "fullName email role"
            );


        if (!complaint) {

            return res.status(404).json({
                message: "Complaint not found",
            });

        }

        if (req.user.role === "student") {

            const ownerId =
                complaint.createdBy?._id?.toString();

            if (
                ownerId !== req.user.id
            ) {

                return res.status(403).json({
                    message:
                        "You can only view your own complaints",
                });

            }

        }


        if (req.user.role === "faculty") {

            const assignedId =
                complaint.assignedTo?._id?.toString();

            if (
                assignedId !== req.user.id
            ) {

                return res.status(403).json({
                    message:
                        "You can only view complaints assigned to you",
                });

            }

        }

        res.status(200).json({
            complaint,
        });


    } catch (error) {

        console.error(
            "Get Complaint By ID Error:",
            error
        );

        res.status(500).json({
            message:
                error.message,
        });

    }

};

const getAllComplaints = async (req, res) => {

    try {

        const complaints = await Complaint.find({
            isArchived: { $ne: true },
        })
            .populate(
                "createdBy",
                "fullName email"
            )
            .populate(
                "assignedTo",
                "fullName email"
            )
            .populate(
                "history.changedBy",
                "fullName email role"
            )
            .sort({
                createdAt: -1,
            });


        res.status(200).json({

            complaints,

        });


    } catch (error) {

        console.error(
            "Get All Complaints Error:",
            error
        );


        res.status(500).json({

            message:
                error.message,

        });

    }

};

const editComplaint = async (req, res) => {

    try {

        const {
            title,
            description,
            category,
            removeImage,
        } = req.body;


        const complaint =
            await Complaint.findById(
                req.params.id
            );


        if (!complaint) {

            return res.status(404).json({
                message: "Complaint not found",
            });

        }

        if (
            req.user.role !== "student"
        ) {

            return res.status(403).json({
                message:
                    "Only students can edit complaints",
            });

        }


        if (
            complaint.createdBy?.toString() !==
            req.user.id
        ) {

            return res.status(403).json({
                message:
                    "You can only edit your own complaints",
            });

        }

        if (
            complaint.status === "Resolved"
        ) {

            return res.status(400).json({
                message:
                    "Resolved complaints cannot be edited",
            });

        }

        if (
            title !== undefined
        ) {

            complaint.title =
                title;

        }


        if (
            description !== undefined
        ) {

            complaint.description =
                description;

        }

        if (
            category !== undefined
        ) {

            complaint.category =
                category;

        }

        if (
            removeImage === "true"
        ) {

            complaint.image =
                "";

        }


        if (
            req.file
        ) {

            complaint.image =
                req.file.path;

        }


        await complaint.save();


        res.status(200).json({

            message:
                "Complaint Updated Successfully",

            complaint,

        });


    } catch (error) {

        console.error(
            "Edit Complaint Error:",
            error
        );


        res.status(500).json({

            message:
                error.message,

        });

    }

};


const updateComplaintStatus = async (
    req,
    res
) => {

    try {

        const {
            status,
            priority,
            dueDate,
            assignedTo,
        } = req.body;

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
            req.user.role === "faculty"
        ) {

            const assignedFacultyId =
                complaint.assignedTo
                    ? complaint.assignedTo.toString()
                    : null;


            if (
                !assignedFacultyId ||
                assignedFacultyId !==
                    req.user.id
            ) {

                return res.status(403).json({

                    message:
                        "You can only update complaints assigned to you",

                });

            }

        }

        const oldStatus =
            complaint.status;


        const oldPriority =
            complaint.priority;


        const oldDueDate =
            complaint.dueDate
                ? new Date(
                    complaint.dueDate
                ).getTime()
                : null;


        const oldAssignedTo =
            complaint.assignedTo
                ? complaint.assignedTo.toString()
                : null;

        if (
            Object.prototype.hasOwnProperty.call(
                req.body,
                "status"
            )
        ) {

            complaint.status =
                status;

        }

        if (
            Object.prototype.hasOwnProperty.call(
                req.body,
                "priority"
            )
        ) {

            complaint.priority =
                priority;

        }

        if (
            Object.prototype.hasOwnProperty.call(
                req.body,
                "dueDate"
            )
        ) {

            complaint.dueDate =
                dueDate || null;

        }

        let newAssignedTo =
            oldAssignedTo;


        const assignmentProvided =
            Object.prototype.hasOwnProperty.call(
                req.body,
                "assignedTo"
            );


        if (
            req.user.role === "admin" &&
            assignmentProvided
        ) {

            const requestedFacultyId =
                assignedTo || null;

            if (!requestedFacultyId) {

                complaint.assignedTo =
                    null;

                newAssignedTo =
                    null;

            } else {

                if (
                    !mongoose.Types.ObjectId.isValid(
                        requestedFacultyId
                    )
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid faculty ID",

                    });

                }

                const faculty =
                    await User.findOne({

                        _id:
                            requestedFacultyId,

                        role:
                            "faculty",

                        isBlocked:
                            false,

                    });


                if (!faculty) {

                    return res.status(400).json({

                        message:
                            "Selected faculty is invalid or unavailable",

                    });

                }


                complaint.assignedTo =
                    faculty._id;


                newAssignedTo =
                    faculty._id.toString();

            }

        }

        const statusChanged =
            oldStatus !==
            complaint.status;


        const priorityChanged =
            oldPriority !==
            complaint.priority;


        const newDueDate =
            complaint.dueDate
                ? new Date(
                    complaint.dueDate
                ).getTime()
                : null;


        const dueDateChanged =
            oldDueDate !==
            newDueDate;


        const assignmentChanged =
            oldAssignedTo !==
            newAssignedTo;

        if (assignmentChanged) {

            if (newAssignedTo) {

                complaint.history.push({

                    action:
                        oldAssignedTo
                            ? "REASSIGNED"
                            : "ASSIGNED",

                    status:
                        complaint.status,

                    changedBy:
                        req.user.id,

                    changedByRole:
                        req.user.role,

                    message:
                        oldAssignedTo
                            ? "Complaint reassigned to another faculty"
                            : "Complaint assigned to faculty",

                });

            } else {

                complaint.history.push({

                    action:
                        "UNASSIGNED",

                    status:
                        complaint.status,

                    changedBy:
                        req.user.id,

                    changedByRole:
                        req.user.role,

                    message:
                        "Complaint assignment removed",

                });

            }

        }


        if (statusChanged) {

            complaint.history.push({

                action:
                    "STATUS_UPDATED",

                status:
                    complaint.status,

                changedBy:
                    req.user.id,

                changedByRole:
                    req.user.role,

                message:
                    `Status changed from "${oldStatus}" to "${complaint.status}"`,

            });

        }


        if (priorityChanged) {

            complaint.history.push({

                action:
                    "PRIORITY_UPDATED",

                status:
                    complaint.status,

                changedBy:
                    req.user.id,

                changedByRole:
                    req.user.role,

                message:
                    `Priority changed from "${oldPriority}" to "${complaint.priority}"`,

            });

        }


        if (dueDateChanged) {

            complaint.history.push({

                action:
                    "DUE_DATE_UPDATED",

                status:
                    complaint.status,

                changedBy:
                    req.user.id,

                changedByRole:
                    req.user.role,

                message:
                    complaint.dueDate
                        ? "Due date updated"
                        : "Due date removed",

            });

        }

        await complaint.save();

        await complaint.populate([

            {
                path: "createdBy",
                select: "fullName email",
            },

            {
                path: "assignedTo",
                select: "fullName email",
            },

        ]);

        const io =
            req.app.get("io");

        const users =
            req.app.get("users") || {};

        if (
            assignmentChanged &&
            newAssignedTo
        ) {

            try {

                const facultyNotification =
                    await Notification.create({

                        user:
                            newAssignedTo,

                        complaint:
                            complaint._id,

                        type:
                            "ASSIGNED",

                        message:
                            `A new complaint has been assigned to you: "${complaint.title}"`,

                    });


                const facultySocketId =
                    users[
                        newAssignedTo
                    ];


                if (
                    facultySocketId &&
                    io
                ) {

                    io.to(
                        facultySocketId
                    ).emit(
                        "newNotification",
                        {
                            message:
                                facultyNotification.message,
                        }
                    );

                }


            } catch (
                assignmentNotificationError
            ) {

                console.error(
                    "Faculty Assignment Notification Error:",
                    assignmentNotificationError
                );

            }

        }

        if (
            statusChanged &&
            complaint.createdBy
        ) {

            try {

                const html =
                    statusUpdateTemplate(

                        complaint
                            .createdBy
                            .fullName,

                        complaint.title,

                        complaint.status,

                        complaint.priority

                    );


                const studentNotification =
                    await Notification.create({

                        user:
                            complaint
                                .createdBy
                                ._id,

                        complaint:
                            complaint._id,

                        type:
                            "STATUS_UPDATED",

                        message:
                            `Your complaint "${complaint.title}" status changed to ${complaint.status}.`,

                    });


                const studentSocketId =
                    users[
                        complaint
                            .createdBy
                            ._id
                            .toString()
                    ];


                if (
                    studentSocketId &&
                    io
                ) {

                    io.to(
                        studentSocketId
                    ).emit(
                        "newNotification",
                        {
                            message:
                                studentNotification.message,
                        }
                    );

                }

                sendEmail(

                    complaint
                        .createdBy
                        .email,

                    "CampusOne | Complaint Status Updated",

                    html

                ).catch(
                    (emailError) => {

                        console.error(
                            "Background Email Error:",
                            emailError.message
                        );

                    }
                );


            } catch (
                notificationError
            ) {

                console.error(
                    "Student Notification Error:",
                    notificationError
                );

            }

        }

        res.status(200).json({

            message:
                "Complaint Updated Successfully",

            complaint,

        });


    } catch (error) {

        console.error(
            "Update Complaint Error:",
            error
        );


        res.status(500).json({

            message:
                error.message,

        });

    }

};

const deleteComplaint = async (
    req,
    res
) => {

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
            req.user.role !== "student"
        ) {

            return res.status(403).json({
                message:
                    "Only students can delete complaints",
            });

        }


        if (
            complaint.createdBy?.toString() !==
            req.user.id
        ) {

            return res.status(403).json({
                message:
                    "You can only delete your own complaints",
            });

        }

        if (
            complaint.status === "Resolved"
        ) {

            return res.status(400).json({
                message:
                    "Resolved complaints cannot be deleted",
            });

        }


        await Complaint.findByIdAndDelete(
            req.params.id
        );


        res.status(200).json({

            message:
                "Complaint Deleted Successfully",

        });


    } catch (error) {

        console.error(
            "Delete Complaint Error:",
            error
        );


        res.status(500).json({

            message:
                error.message,

        });

    }

};

const archiveComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(
            req.params.id
        );

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found",
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "Only admin can archive complaints",
            });
        }

        if (complaint.status !== "Resolved") {
            return res.status(400).json({
                message:
                    "Only resolved complaints can be archived",
            });
        }

        if (complaint.isArchived) {
            return res.status(400).json({
                message:
                    "Complaint is already archived",
            });
        }

        complaint.isArchived = true;
        complaint.archivedAt = new Date();
        complaint.archivedBy = req.user.id;

        await complaint.save();

        res.status(200).json({
            message:
                "Complaint archived successfully",
        });
    } catch (error) {
        console.error(
            "Archive Complaint Error:",
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {

    createComplaint,

    getMyComplaints,

    getAssignedComplaints,

    getComplaintById,

    getAllComplaints,

    editComplaint,

    updateComplaintStatus,

    deleteComplaint,

    archiveComplaint,

};