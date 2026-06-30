const express = require('express');
const {
    addInquiryController,
    getAllInquiriesController,
    updateInquiryController,
    updateInquiryLabelController,
    updateInquiryStatusController
} = require('../controllers/inquiryController.js');
const { verifyToken } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, addInquiryController);
router.get('/all', verifyToken, getAllInquiriesController);
router.put('/update/:id', verifyToken, updateInquiryController);
router.put('/update-label/:id', verifyToken, updateInquiryLabelController);
router.put('/update-status/:id', verifyToken, updateInquiryStatusController);

module.exports = router;
