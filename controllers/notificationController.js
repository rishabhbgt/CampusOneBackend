const Notification = require("../models/Notification");


// Get all notifications
const getNotifications = async (req, res) => {

    try {

        const notifications =
            await Notification.find({
                user: req.user.id,
            })
            .populate("complaint", "title")
            .sort({
                createdAt: -1,
            });

        res.status(200).json({
            notifications,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};


// Mark one notification as read
const markNotificationRead = async (req, res) => {

    try {

        await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id,
            },
            {
                isRead: true,
            }
        );

        res.status(200).json({
            message:
                "Notification marked as read",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};


// Mark all notifications as read
const markAllNotificationsRead = async (req, res) => {

    try {

        await Notification.updateMany(
            {
                user: req.user.id,
                isRead: false,
            },
            {
                $set: {
                    isRead: true,
                },
            }
        );

        res.status(200).json({
            message:
                "All notifications marked as read",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};


module.exports = {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
};