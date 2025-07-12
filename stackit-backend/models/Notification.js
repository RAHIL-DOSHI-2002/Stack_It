const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // who should be notified
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
