const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification');
const authMiddleware = require('../middleware/authMiddleware');

// Get all notifications for logged-in user
router.get('/', authMiddleware, notificationController.getNotifications);

// Mark a notification as read
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
