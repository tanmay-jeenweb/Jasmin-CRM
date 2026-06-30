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
    getAllFindStoresController
} = require('../controllers/inProcessFranchiseController.js');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, addInProcessFranchiseController);
router.get('/all', verifyToken, getAllInProcessFranchisesController);
router.get('/find-stores/all', verifyToken, verifyAdmin, getAllFindStoresController);
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

module.exports = router;

