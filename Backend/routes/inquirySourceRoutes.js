const express = require('express');
const {
    addInquirySourceController,
    getAllInquirySourcesController,
    updateInquirySourceController,
    deleteInquirySourceController
} = require('../controllers/inquirySourceController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('inquiry_source_master', 'write'), addInquirySourceController);
router.get('/all', verifyToken, verifyPermission('inquiry_source_master', 'read'), getAllInquirySourcesController);
router.put('/update/:id', verifyToken, verifyPermission('inquiry_source_master', 'update'), updateInquirySourceController);
router.delete('/delete/:id', verifyToken, verifyPermission('inquiry_source_master', 'delete'), deleteInquirySourceController);

module.exports = router;
