const express = require('express');
const {
    addLabelController,
    getAllLabelsController,
    updateLabelController,
    deleteLabelController
} = require('../controllers/labelController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('label_master', 'write'), addLabelController);
router.get('/all', verifyToken, verifyPermission('label_master', 'read'), getAllLabelsController);
router.put('/update/:id', verifyToken, verifyPermission('label_master', 'update'), updateLabelController);
router.delete('/delete/:id', verifyToken, verifyPermission('label_master', 'delete'), deleteLabelController);

module.exports = router;
