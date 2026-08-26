const express = require('express');
const {
    syncBranchesController,
    getUnmappedFranchisesController,
    getUnmappedBranchesController,
    getAllMappingsController,
    createMappingController,
    deleteMappingController
} = require('../controllers/branchFranchiseMappingController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/sync', verifyToken, verifyPermission('branch_franchise_mapping', 'write'), syncBranchesController);
router.get('/unmapped-franchises', verifyToken, verifyPermission('branch_franchise_mapping', 'read'), getUnmappedFranchisesController);
router.get('/unmapped-branches', verifyToken, verifyPermission('branch_franchise_mapping', 'read'), getUnmappedBranchesController);
router.get('/all', verifyToken, verifyPermission('branch_franchise_mapping', 'read'), getAllMappingsController);
router.post('/map', verifyToken, verifyPermission('branch_franchise_mapping', 'write'), createMappingController);
router.delete('/unmap/:id', verifyToken, verifyPermission('branch_franchise_mapping', 'delete'), deleteMappingController);

module.exports = router;
