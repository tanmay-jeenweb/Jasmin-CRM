const express = require('express');
const {
    addReminderController,
    getRemindersController
} = require('../controllers/reminderController.js');
const { verifyToken } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, addReminderController);
router.get('/inquiry/:inquiryId', verifyToken, getRemindersController);

module.exports = router;
