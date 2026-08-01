const express = require('express');
const {
    addCallLogController,
    getCallLogsController
} = require('../controllers/callLogController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('call_log_master', 'write'), addCallLogController);
router.get('/inquiry/:inquiryId', verifyToken, verifyPermission('call_log_master', 'read'), getCallLogsController);

module.exports = router;
