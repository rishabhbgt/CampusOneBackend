const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} = require("../controllers/notificationController");

// Get Notifications
router.get(
    "/",
    authMiddleware,
    getNotifications
);

// Mark One Notification Read
router.put(
    "/:id/read",
    authMiddleware,
    markNotificationRead
);

// Mark All Notifications Read
router.put(
    "/read-all",
    authMiddleware,
    markAllNotificationsRead
);

module.exports = router;