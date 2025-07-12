const Notification = require('../models/Notification');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('question answer');
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch notifications.' });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: 'Failed to mark notification as read.' });
    }
};

// Create a notification (used when someone answers a question)
exports.createNotification = async ({ user, question, answer, message }) => {
    try {
        const notification = new Notification({ user, question, answer, message });
        await notification.save();
        return notification;
    } catch (err) {
        // Log error but don't crash
        console.error('Notification creation error:', err);
    }
};
