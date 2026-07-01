const express = require('express');
const {
    addInProcessFranchiseController,
    getAllInProcessFranchisesController,
    updateInProcessFranchiseController,
    deleteInProcessFranchiseController,
    getInProcessFranchiseByIdController,
    upsertFindStoreController,
    approveFindStoreController,
    rejectFindStoreController,
    getAllFindStoresController,
    saveAgreementGstController,
    saveDocPrepController,
    saveStorePlanningController,
    saveStoreAmbianceController,
    saveFranchiseTeamController,
    saveFranchiseMarketingController,
    saveFranchiseInstallationController,
    saveFranchiseSwipeMachineController,
    saveFranchiseTrainingController,
    saveFranchiseDepositStockController,
    saveFranchiseMappingController,
    saveFranchiseInsuranceController,
    saveFranchiseBranchFinanceCodeController,
    getAllCompletedFranchisesController,
    getAllDepositStocksController,
    approveFranchiseDepositStockController,
    rejectFranchiseDepositStockController,
    convertToFranchiseController
} = require('../controllers/inProcessFranchiseController.js');
const { verifyToken, verifyAdmin, verifyPermission, verifyFindStoreApproved } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, addInProcessFranchiseController);
router.get('/all', verifyToken, getAllInProcessFranchisesController);
router.get('/completed/all', verifyToken, getAllCompletedFranchisesController);
router.get('/find-stores/all', verifyToken, verifyPermission('store_details_approval', 'read'), getAllFindStoresController);
router.get('/deposit-stocks/all', verifyToken, verifyPermission('deposit_stock_approval', 'read'), getAllDepositStocksController);
router.get('/:id', verifyToken, getInProcessFranchiseByIdController);
router.put('/update/:id', verifyToken, updateInProcessFranchiseController);
router.delete('/delete/:id', verifyToken, deleteInProcessFranchiseController);

// Find Store stage routes
router.post('/:id/find-store', verifyToken, upload.fields([
    { name: 'storePhoto', maxCount: 20 },
    { name: 'authorityCertificate', maxCount: 1 }
]), upsertFindStoreController);

router.post('/:id/find-store/approve', verifyToken, verifyPermission('store_details_approval', 'write'), approveFindStoreController);
router.post('/:id/find-store/reject', verifyToken, verifyPermission('store_details_approval', 'write'), rejectFindStoreController);

// Agreement & GST route
router.post('/:id/agreement-gst', verifyToken, verifyFindStoreApproved, upload.any(), saveAgreementGstController);

// Document Preparation route
router.post('/:id/doc-prep', verifyToken, verifyFindStoreApproved, upload.any(), saveDocPrepController);

// Store Planning route
router.post('/:id/store-planning', verifyToken, verifyFindStoreApproved, upload.any(), saveStorePlanningController);

// Store Ambiance route
router.post('/:id/store-ambiance', verifyToken, verifyFindStoreApproved, upload.any(), saveStoreAmbianceController);

// Team route
router.post('/:id/team', verifyToken, verifyFindStoreApproved, saveFranchiseTeamController);

// Marketing route
router.post('/:id/marketing', verifyToken, verifyFindStoreApproved, upload.any(), saveFranchiseMarketingController);

// Installation route
router.post('/:id/installation', verifyToken, verifyFindStoreApproved, saveFranchiseInstallationController);

// Swipe Machine route
router.post('/:id/swipe-machine', verifyToken, verifyFindStoreApproved, saveFranchiseSwipeMachineController);

// Training route
router.post('/:id/training', verifyToken, verifyFindStoreApproved, saveFranchiseTrainingController);

// Mapping route
router.post('/:id/mapping', verifyToken, verifyFindStoreApproved, saveFranchiseMappingController);

// Insurance route
router.post('/:id/insurance', verifyToken, verifyFindStoreApproved, upload.any(), saveFranchiseInsuranceController);

// Branch Finance Code route
router.post('/:id/branch-finance-code', verifyToken, verifyFindStoreApproved, saveFranchiseBranchFinanceCodeController);

// Deposit & Stock route
router.post('/:id/deposit-stock', verifyToken, verifyFindStoreApproved, saveFranchiseDepositStockController);
router.post('/:id/deposit-stock/approve', verifyToken, verifyPermission('deposit_stock_approval', 'write'), verifyFindStoreApproved, approveFranchiseDepositStockController);
router.post('/:id/deposit-stock/reject', verifyToken, verifyPermission('deposit_stock_approval', 'write'), verifyFindStoreApproved, rejectFranchiseDepositStockController);

// Convert to active Franchise route
router.post('/:id/convert', verifyToken, convertToFranchiseController);

module.exports = router;

