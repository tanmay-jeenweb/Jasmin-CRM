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
    convertToFranchiseController,
    getFranchiseActivityLogsController
} = require('../controllers/inProcessFranchiseController.js');
const { verifyToken, verifyAdmin, verifyPermission, verifyFindStoreApproved } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('in_process_franchise', 'write'), addInProcessFranchiseController);
router.get('/all', verifyToken, verifyPermission('in_process_franchise', 'read'), getAllInProcessFranchisesController);
router.get('/completed/all', verifyToken, verifyPermission('in_process_franchise', 'read'), getAllCompletedFranchisesController);
router.get('/find-stores/all', verifyToken, verifyPermission('store_details_approval', 'read'), getAllFindStoresController);
router.get('/deposit-stocks/all', verifyToken, verifyPermission('deposit_stock_approval', 'read'), getAllDepositStocksController);
router.get('/:id', verifyToken, verifyPermission('in_process_franchise', 'read'), getInProcessFranchiseByIdController);
router.put('/update/:id', verifyToken, verifyPermission('in_process_franchise', 'update'), updateInProcessFranchiseController);
router.delete('/delete/:id', verifyToken, verifyPermission('in_process_franchise', 'delete'), deleteInProcessFranchiseController);

// Find Store stage routes
router.post('/:id/find-store', verifyToken, verifyPermission('in_process_franchise', 'update'), upload.fields([
    { name: 'storePhoto', maxCount: 20 },
    { name: 'authorityCertificate', maxCount: 1 },
    { name: 'informationSheet', maxCount: 1 }
]), upsertFindStoreController);

router.post('/:id/find-store/approve', verifyToken, verifyPermission('store_details_approval', 'write'), approveFindStoreController);
router.post('/:id/find-store/reject', verifyToken, verifyPermission('store_details_approval', 'write'), rejectFindStoreController);

// Agreement & GST route
router.post('/:id/agreement-gst', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, upload.any(), saveAgreementGstController);

// Document Preparation route
router.post('/:id/doc-prep', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, upload.any(), saveDocPrepController);

// Store Planning route
router.post('/:id/store-planning', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, upload.any(), saveStorePlanningController);

// Store Ambiance route
router.post('/:id/store-ambiance', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, upload.any(), saveStoreAmbianceController);

// Team route
router.post('/:id/team', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, saveFranchiseTeamController);

// Marketing route
router.post('/:id/marketing', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, upload.any(), saveFranchiseMarketingController);

// Installation route
router.post('/:id/installation', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, saveFranchiseInstallationController);

// Swipe Machine route
router.post('/:id/swipe-machine', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, saveFranchiseSwipeMachineController);

// Training route
router.post('/:id/training', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, saveFranchiseTrainingController);

// Mapping route
router.post('/:id/mapping', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, saveFranchiseMappingController);

// Insurance route
router.post('/:id/insurance', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, upload.any(), saveFranchiseInsuranceController);

// Branch Finance Code route
router.post('/:id/branch-finance-code', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, saveFranchiseBranchFinanceCodeController);

// Deposit & Stock route
router.post('/:id/deposit-stock', verifyToken, verifyPermission('in_process_franchise', 'update'), verifyFindStoreApproved, saveFranchiseDepositStockController);
router.post('/:id/deposit-stock/approve', verifyToken, verifyPermission('deposit_stock_approval', 'write'), verifyFindStoreApproved, approveFranchiseDepositStockController);
router.post('/:id/deposit-stock/reject', verifyToken, verifyPermission('deposit_stock_approval', 'write'), verifyFindStoreApproved, rejectFranchiseDepositStockController);

// Convert to active Franchise route
router.post('/:id/convert', verifyToken, verifyPermission('in_process_franchise', 'update'), convertToFranchiseController);

router.get('/:id/activity-logs', verifyToken, verifyPermission('in_process_franchise', 'read'), getFranchiseActivityLogsController);

module.exports = router;

