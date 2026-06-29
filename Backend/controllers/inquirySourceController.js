const {
    createInquirySource,
    getAllInquirySources,
    updateInquirySource,
    deleteInquirySource,
    getInquirySourceById
} = require('../models/inquirySourceModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addInquirySourceController = async (req, res) => {
    try {
        const { sourceName } = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!sourceName || !sourceName.trim()) {
            return res.status(400).json({ success: false, message: 'Source name is required' });
        }

        const result = await createInquirySource(sourceName.trim(), addedBy, deviceId);
        
        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Inquiry Source Master',
            'created',
            null,
            {
                id: result.insertId,
                source_name: sourceName.trim(),
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Inquiry source added successfully',
            data: { id: result.insertId, source_name: sourceName.trim() }
        });
    } catch (error) {
        console.error('Error adding inquiry source:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Inquiry source name already exists' });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllInquirySourcesController = async (req, res) => {
    try {
        const sources = await getAllInquirySources();
        res.status(200).json({
            success: true,
            message: 'Inquiry sources retrieved successfully',
            data: sources
        });
    } catch (error) {
        console.error('Error retrieving inquiry sources:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateInquirySourceController = async (req, res) => {
    try {
        const { id } = req.params;
        const { sourceName } = req.body;

        if (!sourceName || !sourceName.trim()) {
            return res.status(400).json({ success: false, message: 'Source name is required' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        const beforeData = await getInquirySourceById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Inquiry source not found' });
        }

        await updateInquirySource(id, sourceName.trim());
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Inquiry Source Master',
            'updated',
            beforeData,
            {
                ...beforeData,
                source_name: sourceName.trim()
            }
        );

        res.status(200).json({ success: true, message: 'Inquiry source updated successfully' });
    } catch (error) {
        console.error('Error updating inquiry source:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Inquiry source name already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteInquirySourceController = async (req, res) => {
    try {
        const { id } = req.params;
        const beforeData = await getInquirySourceById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Inquiry source not found' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        await deleteInquirySource(id);
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Inquiry Source Master',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({ success: true, message: 'Inquiry source deleted successfully' });
    } catch (error) {
        console.error('Error deleting inquiry source:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    addInquirySourceController,
    getAllInquirySourcesController,
    updateInquirySourceController,
    deleteInquirySourceController
};
