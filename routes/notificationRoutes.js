const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} = require("../controllers/notificationController");


// Get all notifications
router.get(
    "/",
    authMiddleware,
    getNotifications
);


// Mark all notifications as read
// IMPORTANT: This route must come BEFORE /:id/read
router.put(
    "/read-all",
    authMiddleware,
    markAllNotificationsRead
);


// Mark one notification as read
router.put(
    "/:id/read",
    authMiddleware,
    markNotificationRead
);


module.exports = router;