const express = require("express");

const router =
    express.Router();


const upload =
    require("../middleware/upload");


const authMiddleware =
    require("../middleware/authMiddleware");


const adminMiddleware =
    require("../middleware/adminMiddleware");


const adminOrFacultyMiddleware =
    require("../middleware/adminOrFacultyMiddleware");


const roleMiddleware =
    require("../middleware/roleMiddleware");


const {
    createComplaint,
    getMyComplaints,
    getAssignedComplaints,
    getComplaintById,
    updateComplaintStatus,
    getAllComplaints,
    editComplaint,
    deleteComplaint,
    archiveComplaint,
} = require("../controllers/complaintController");

router.post(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    upload.single("image"),
    createComplaint
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("student"),
    getMyComplaints
);

router.get(
    "/assigned",
    authMiddleware,
    roleMiddleware("faculty"),
    getAssignedComplaints
);

router.get(
    "/all",
    authMiddleware,
    adminMiddleware,
    getAllComplaints
);

router.put(
    "/archive/:id",
    authMiddleware,
    adminMiddleware,
    archiveComplaint
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
    roleMiddleware("student"),
    upload.single("image"),
    editComplaint
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("student"),
    deleteComplaint
);


module.exports = router;