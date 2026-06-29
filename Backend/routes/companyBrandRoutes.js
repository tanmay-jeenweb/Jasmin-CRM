const express = require('express');
const {
    addCompanyBrandController,
    getAllCompanyBrandsController,
    updateCompanyBrandController,
    deleteCompanyBrandController
} = require('../controllers/companyBrandController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('company_brand_master', 'write'), addCompanyBrandController);
router.get('/all', verifyToken, verifyPermission('company_brand_master', 'read'), getAllCompanyBrandsController);
router.put('/update/:id', verifyToken, verifyPermission('company_brand_master', 'update'), updateCompanyBrandController);
router.delete('/delete/:id', verifyToken, verifyPermission('company_brand_master', 'delete'), deleteCompanyBrandController);

module.exports = router;
