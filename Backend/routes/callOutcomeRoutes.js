const express = require('express');
const {
    addCallOutcomeController,
    getAllCallOutcomesController,
    updateCallOutcomeController,
    deleteCallOutcomeController
} = require('../controllers/callOutcomeController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('call_outcome_master', 'write'), addCallOutcomeController);
router.get('/all', verifyToken, verifyPermission('call_outcome_master', 'read'), getAllCallOutcomesController);
router.put('/update/:id', verifyToken, verifyPermission('call_outcome_master', 'update'), updateCallOutcomeController);
router.delete('/delete/:id', verifyToken, verifyPermission('call_outcome_master', 'delete'), deleteCallOutcomeController);

module.exports = router;
