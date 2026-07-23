const Complaint = require("../models/Complaint");


const getAssignedComplaints = async (req, res) => {

    try {

        const facultyId = req.user.id;

        const complaints = await Complaint.find({
            assignedTo: facultyId,
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

            message:
                "Assigned complaints fetched successfully",

            complaints,

        });

    } catch (error) {

        console.error(
            "Get Assigned Complaints Error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to fetch assigned complaints",

        });

    }

};


const updateAssignedComplaintStatus = async (req, res) => {

    try {

        const facultyId = req.user.id;

        const { status } = req.body;

        // Validate status
        const allowedStatuses = [
            "Pending",
            "In Progress",
            "Resolved",
        ];

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({

                message:
                    "Invalid complaint status",

            });

        }


        // Important:
        // Faculty sirf apni assigned complaint update kar sakta hai

        const complaint =
            await Complaint.findOneAndUpdate(

                {
                    _id: req.params.id,

                    assignedTo: facultyId,
                },

                {
                    status,
                },

                {
                    new: true,
                }

            )
            .populate(
                "createdBy",
                "fullName email"
            )
            .populate(
                "assignedTo",
                "fullName email"
            );

        if (!complaint) {

            return res.status(404).json({

                message:
                    "Complaint not found or not assigned to you",

            });

        }


        res.status(200).json({

            message:
                "Complaint status updated successfully",

            complaint,

        });


    } catch (error) {

        console.error(
            "Update Assigned Complaint Error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to update complaint status",

        });

    }

};


module.exports = {

    getAssignedComplaints,

    updateAssignedComplaintStatus,

};