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
    getAllCompletedFranchisesController,
    getAllDepositStocksController,
    approveFranchiseDepositStockController,
    rejectFranchiseDepositStockController
} = require('../controllers/inProcessFranchiseController.js');
const { verifyToken, verifyAdmin, verifyFindStoreApproved } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, addInProcessFranchiseController);
router.get('/all', verifyToken, getAllInProcessFranchisesController);
router.get('/completed/all', verifyToken, getAllCompletedFranchisesController);
router.get('/find-stores/all', verifyToken, verifyAdmin, getAllFindStoresController);
router.get('/deposit-stocks/all', verifyToken, verifyAdmin, getAllDepositStocksController);
router.get('/:id', verifyToken, getInProcessFranchiseByIdController);
router.put('/update/:id', verifyToken, updateInProcessFranchiseController);
router.delete('/delete/:id', verifyToken, deleteInProcessFranchiseController);

// Find Store stage routes
router.post('/:id/find-store', verifyToken, upload.fields([
    { name: 'storePhoto', maxCount: 1 },
    { name: 'authorityCertificate', maxCount: 1 }
]), upsertFindStoreController);

router.post('/:id/find-store/approve', verifyToken, verifyAdmin, approveFindStoreController);
router.post('/:id/find-store/reject', verifyToken, verifyAdmin, rejectFindStoreController);

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

// Deposit & Stock route
router.post('/:id/deposit-stock', verifyToken, verifyFindStoreApproved, saveFranchiseDepositStockController);
router.post('/:id/deposit-stock/approve', verifyToken, verifyAdmin, verifyFindStoreApproved, approveFranchiseDepositStockController);
router.post('/:id/deposit-stock/reject', verifyToken, verifyAdmin, verifyFindStoreApproved, rejectFranchiseDepositStockController);

module.exports = router;

