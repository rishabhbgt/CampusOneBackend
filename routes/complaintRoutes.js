const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const authMiddleware =
    require("../middleware/authMiddleware");

const adminMiddleware =
    require("../middleware/adminMiddleware");

const adminOrFacultyMiddleware =
    require("../middleware/adminOrFacultyMiddleware");


const {
    createComplaint,
    getMyComplaints,
    getAssignedComplaints,
    getComplaintById,
    updateComplaintStatus,
    getAllComplaints,
    editComplaint,
    deleteComplaint,
} = require("../controllers/complaintController");


router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    createComplaint
);

router.get(
    "/my",
    authMiddleware,
    getMyComplaints
);

router.get(
    "/assigned",
    authMiddleware,
    getAssignedComplaints
);

router.get(
    "/all",
    authMiddleware,
    adminMiddleware,
    getAllComplaints
);

router.get(
    "/:id",
    authMiddleware,
    getComplaintById
);

router.put(
    "/:id",
    authMiddleware,
    adminOrFacultyMiddleware,
    updateComplaintStatus
);

router.put(
    "/edit/:id",
    authMiddleware,
    upload.single("image"),
    editComplaint
);

router.delete(
    "/:id",
    authMiddleware,
    deleteComplaint
);


module.exports = router;