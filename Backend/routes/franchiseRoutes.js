const express = require('express');
const {
    getAllFranchisesController,
    getFranchiseByIdController,
    updateFranchiseController,
    deleteFranchiseController
} = require('../controllers/franchiseController.js');
const { verifyToken } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/all', verifyToken, getAllFranchisesController);
router.get('/:id', verifyToken, getFranchiseByIdController);
router.put('/update/:id', verifyToken, updateFranchiseController);
router.delete('/delete/:id', verifyToken, deleteFranchiseController);

module.exports = router;
