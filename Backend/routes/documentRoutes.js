const express = require('express');
const {
    addDocumentController,
    getAllDocumentsController,
    updateDocumentController,
    deleteDocumentController
} = require('../controllers/documentController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('document_master', 'write'), addDocumentController);
router.get('/all', verifyToken, verifyPermission('document_master', 'read'), getAllDocumentsController);
router.put('/update/:id', verifyToken, verifyPermission('document_master', 'update'), updateDocumentController);
router.delete('/delete/:id', verifyToken, verifyPermission('document_master', 'delete'), deleteDocumentController);

module.exports = router;
