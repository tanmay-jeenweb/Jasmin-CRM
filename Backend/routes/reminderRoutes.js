const express = require('express');
const {
    addReminderController,
    getRemindersController,
    getUnreadRemindersController,
    markAsReadController
} = require('../controllers/reminderController.js');
const { verifyToken } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, addReminderController);
router.get('/unread', verifyToken, getUnreadRemindersController);
router.get('/inquiry/:inquiryId', verifyToken, getRemindersController);
router.put('/:id/read', verifyToken, markAsReadController);

module.exports = router;
