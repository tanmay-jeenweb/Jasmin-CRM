const express = require('express');
const {
    addCallLogController,
    getCallLogsController
} = require('../controllers/callLogController.js');
const { verifyToken } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, addCallLogController);
router.get('/inquiry/:inquiryId', verifyToken, getCallLogsController);

module.exports = router;
