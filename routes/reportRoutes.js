const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    downloadExcelReport,
    downloadPDFReport,
} = require("../controllers/reportController");

router.get(
    "/excel",
    authMiddleware,
    adminMiddleware,
    downloadExcelReport
);

router.get(
    "/pdf",
    authMiddleware,
    adminMiddleware,
    downloadPDFReport
);

module.exports = router;