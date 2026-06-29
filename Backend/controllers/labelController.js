const {
    createLabel,
    getAllLabels,
    updateLabel,
    deleteLabel,
    getLabelById
} = require('../models/labelModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addLabelController = async (req, res) => {
    try {
        const { labelName } = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!labelName || !labelName.trim()) {
            return res.status(400).json({ success: false, message: 'Label name is required' });
        }

        const result = await createLabel(labelName.trim(), addedBy, deviceId);
        
        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Label Master',
            'created',
            null,
            {
                id: result.insertId,
                label_name: labelName.trim(),
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Label added successfully',
            data: { id: result.insertId, label_name: labelName.trim() }
        });
    } catch (error) {
        console.error('Error adding label:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Label name already exists' });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllLabelsController = async (req, res) => {
    try {
        const labels = await getAllLabels();
        res.status(200).json({
            success: true,
            message: 'Labels retrieved successfully',
            data: labels
        });
    } catch (error) {
        console.error('Error retrieving labels:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateLabelController = async (req, res) => {
    try {
        const { id } = req.params;
        const { labelName } = req.body;

        if (!labelName || !labelName.trim()) {
            return res.status(400).json({ success: false, message: 'Label name is required' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        const beforeData = await getLabelById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Label not found' });
        }

        await updateLabel(id, labelName.trim());
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Label Master',
            'updated',
            beforeData,
            {
                ...beforeData,
                label_name: labelName.trim()
            }
        );

        res.status(200).json({ success: true, message: 'Label updated successfully' });
    } catch (error) {
        console.error('Error updating label:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Label name already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteLabelController = async (req, res) => {
    try {
        const { id } = req.params;
        const beforeData = await getLabelById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Label not found' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        await deleteLabel(id);
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Label Master',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({ success: true, message: 'Label deleted successfully' });
    } catch (error) {
        console.error('Error deleting label:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    addLabelController,
    getAllLabelsController,
    updateLabelController,
    deleteLabelController
};
