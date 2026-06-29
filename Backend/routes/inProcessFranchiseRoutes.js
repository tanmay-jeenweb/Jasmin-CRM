const express = require('express');
const {
    addInProcessFranchiseController,
    getAllInProcessFranchisesController,
    updateInProcessFranchiseController,
    deleteInProcessFranchiseController
} = require('../controllers/inProcessFranchiseController.js');
const { verifyToken } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, addInProcessFranchiseController);
router.get('/all', verifyToken, getAllInProcessFranchisesController);
router.put('/update/:id', verifyToken, updateInProcessFranchiseController);
router.delete('/delete/:id', verifyToken, deleteInProcessFranchiseController);

module.exports = router;
