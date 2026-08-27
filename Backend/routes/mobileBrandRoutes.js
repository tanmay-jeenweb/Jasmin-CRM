const express = require('express');
const {
    getAllMobileBrandsController
} = require('../controllers/mobileBrandController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('mobile_brand_master', 'write'), (req, res) => {
    res.status(403).json({ success: false, message: 'Direct modifications are disabled. Data is synced from ERP.' });
});

router.get('/all', verifyToken, verifyPermission('mobile_brand_master', 'read'), getAllMobileBrandsController);

router.put('/update/:id', verifyToken, verifyPermission('mobile_brand_master', 'update'), (req, res) => {
    res.status(403).json({ success: false, message: 'Direct modifications are disabled. Data is synced from ERP.' });
});

router.delete('/delete/:id', verifyToken, verifyPermission('mobile_brand_master', 'delete'), (req, res) => {
    res.status(403).json({ success: false, message: 'Direct modifications are disabled. Data is synced from ERP.' });
});

module.exports = router;
