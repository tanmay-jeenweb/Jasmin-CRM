const express = require('express');
const {
    addInquiryController,
    getAllInquiriesController
} = require('../controllers/inquiryController.js');
const { verifyToken } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, addInquiryController);
router.get('/all', verifyToken, getAllInquiriesController);

module.exports = router;
