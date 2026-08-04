const express = require('express');
const {
    getAllFranchisesController,
    getFranchiseByIdController,
    updateFranchiseController,
    deleteFranchiseController
} = require('../controllers/franchiseController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/all', verifyToken, verifyPermission('franchise_master', 'read'), getAllFranchisesController);
router.get('/:id', verifyToken, verifyPermission('franchise_master', 'read'), getFranchiseByIdController);
router.put('/update/:id', verifyToken, verifyPermission('franchise_master', 'update'), updateFranchiseController);
router.delete('/delete/:id', verifyToken, verifyPermission('franchise_master', 'delete'), deleteFranchiseController);

module.exports = router;
