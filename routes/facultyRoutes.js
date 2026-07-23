const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const facultyMiddleware =
    require("../middleware/facultyMiddleware");

const {
    getAssignedComplaints,
    updateAssignedComplaintStatus,
} = require("../controllers/facultyController");


router.get(
    "/assigned",
    authMiddleware,
    facultyMiddleware,
    getAssignedComplaints
);


router.put(
    "/assigned/:id/status",
    authMiddleware,
    facultyMiddleware,
    updateAssignedComplaintStatus
);


module.exports = router;