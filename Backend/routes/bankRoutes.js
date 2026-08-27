const express = require('express');
const {
    getAllBanksController
} = require('../controllers/bankController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('bank_master', 'write'), (req, res) => {
    res.status(403).json({ success: false, message: 'Direct modifications are disabled. Data is synced from ERP.' });
});

router.get('/all', verifyToken, verifyPermission('bank_master', 'read'), getAllBanksController);

router.put('/update/:id', verifyToken, verifyPermission('bank_master', 'update'), (req, res) => {
    res.status(403).json({ success: false, message: 'Direct modifications are disabled. Data is synced from ERP.' });
});

router.delete('/delete/:id', verifyToken, verifyPermission('bank_master', 'delete'), (req, res) => {
    res.status(403).json({ success: false, message: 'Direct modifications are disabled. Data is synced from ERP.' });
});

module.exports = router;
