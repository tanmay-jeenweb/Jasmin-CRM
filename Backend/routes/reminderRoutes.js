const express = require('express');
const {
    addReminderController,
    getRemindersController,
    getUnreadRemindersController,
    markAsReadController
} = require('../controllers/reminderController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('reminder_master', 'write'), addReminderController);
router.get('/unread', verifyToken, verifyPermission('reminder_master', 'read'), getUnreadRemindersController);
router.get('/inquiry/:inquiryId', verifyToken, verifyPermission('reminder_master', 'read'), getRemindersController);
router.put('/:id/read', verifyToken, verifyPermission('reminder_master', 'update'), markAsReadController);

module.exports = router;
