const express = require('express');
const {
    syncMappingsController,
    syncFinanceCodesController
} = require('../controllers/franchiseSyncController.js');

const router = express.Router();

// Route for Endpoint A: Sync Mappings
router.post('/sync-relations/:branchId', syncMappingsController);

// Route for Endpoint B: Sync Finance Codes
router.post('/sync-finance-codes/:branchId', syncFinanceCodesController);

module.exports = router;

