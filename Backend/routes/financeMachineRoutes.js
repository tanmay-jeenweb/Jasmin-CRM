const express = require('express');
const {
    getAllFinanceMachinesController
} = require('../controllers/financeMachineController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('finance_machine_master', 'write'), (req, res) => {
    res.status(403).json({ success: false, message: 'Direct modifications are disabled. Data is synced from ERP.' });
});

router.get('/all', verifyToken, verifyPermission('finance_machine_master', 'read'), getAllFinanceMachinesController);

router.put('/update/:id', verifyToken, verifyPermission('finance_machine_master', 'update'), (req, res) => {
    res.status(403).json({ success: false, message: 'Direct modifications are disabled. Data is synced from ERP.' });
});

router.delete('/delete/:id', verifyToken, verifyPermission('finance_machine_master', 'delete'), (req, res) => {
    res.status(403).json({ success: false, message: 'Direct modifications are disabled. Data is synced from ERP.' });
});

module.exports = router;
