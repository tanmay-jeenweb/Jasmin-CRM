const {
    createDocument,
    getAllDocuments,
    updateDocument,
    deleteDocument,
    getDocumentById
} = require('../models/documentModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addDocumentController = async (req, res) => {
    try {
        const { docType, isRequired } = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!docType || !docType.trim()) {
            return res.status(400).json({ success: false, message: 'Document type is required' });
        }

        const requiredVal = isRequired === true || isRequired === 1 || isRequired === 'yes';

        const result = await createDocument(docType.trim(), requiredVal, addedBy, deviceId);
        
        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Document Master',
            'created',
            null,
            {
                id: result.insertId,
                doc_type: docType.trim(),
                is_required: requiredVal ? 1 : 0,
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Document type added successfully',
            data: { id: result.insertId, doc_type: docType.trim(), is_required: requiredVal }
        });
    } catch (error) {
        console.error('Error adding document type:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Document type already exists' });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllDocumentsController = async (req, res) => {
    try {
        const docs = await getAllDocuments();
        res.status(200).json({
            success: true,
            message: 'Document types retrieved successfully',
            data: docs
        });
    } catch (error) {
        console.error('Error retrieving document types:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateDocumentController = async (req, res) => {
    try {
        const { id } = req.params;
        const { docType, isRequired } = req.body;

        if (!docType || !docType.trim()) {
            return res.status(400).json({ success: false, message: 'Document type is required' });
        }

        const requiredVal = isRequired === true || isRequired === 1 || isRequired === 'yes';
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        const beforeData = await getDocumentById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Document type not found' });
        }

        await updateDocument(id, docType.trim(), requiredVal);
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Document Master',
            'updated',
            beforeData,
            {
                ...beforeData,
                doc_type: docType.trim(),
                is_required: requiredVal ? 1 : 0
            }
        );

        res.status(200).json({ success: true, message: 'Document type updated successfully' });
    } catch (error) {
        console.error('Error updating document type:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Document type already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteDocumentController = async (req, res) => {
    try {
        const { id } = req.params;
        const beforeData = await getDocumentById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Document type not found' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        await deleteDocument(id);
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Document Master',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({ success: true, message: 'Document type deleted successfully' });
    } catch (error) {
        console.error('Error deleting document type:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    addDocumentController,
    getAllDocumentsController,
    updateDocumentController,
    deleteDocumentController
};
