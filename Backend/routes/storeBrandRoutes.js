const express = require('express');
const {
    addStoreBrandController,
    getAllStoreBrandsController,
    updateStoreBrandController,
    deleteStoreBrandController
} = require('../controllers/storeBrandController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('store_brand_master', 'write'), addStoreBrandController);
router.get('/all', verifyToken, verifyPermission('store_brand_master', 'read'), getAllStoreBrandsController);
router.put('/update/:id', verifyToken, verifyPermission('store_brand_master', 'update'), updateStoreBrandController);
router.delete('/delete/:id', verifyToken, verifyPermission('store_brand_master', 'delete'), deleteStoreBrandController);

module.exports = router;
