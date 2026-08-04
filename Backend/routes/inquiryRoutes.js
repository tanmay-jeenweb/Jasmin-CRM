const express = require('express');
const {
    addInquiryController,
    getAllInquiriesController,
    updateInquiryController,
    updateInquiryLabelController,
    updateInquiryStatusController
} = require('../controllers/inquiryController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('inquiry_master', 'write'), addInquiryController);
router.get('/all', verifyToken, verifyPermission('inquiry_master', 'read'), getAllInquiriesController);
router.put('/update/:id', verifyToken, verifyPermission('inquiry_master', 'update'), updateInquiryController);
router.put('/update-label/:id', verifyToken, verifyPermission('inquiry_master', 'update'), updateInquiryLabelController);
router.put('/update-status/:id', verifyToken, verifyPermission('inquiry_master', 'update'), updateInquiryStatusController);

module.exports = router;
