const {
    createCallOutcome,
    getAllCallOutcomes,
    updateCallOutcome,
    deleteCallOutcome,
    getCallOutcomeById
} = require('../models/callOutcomeModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addCallOutcomeController = async (req, res) => {
    try {
        const { outcomeName } = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!outcomeName || !outcomeName.trim()) {
            return res.status(400).json({ success: false, message: 'Outcome name is required' });
        }

        const result = await createCallOutcome(outcomeName.trim(), addedBy, deviceId);
        
        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Call Outcome Master',
            'created',
            null,
            {
                id: result.insertId,
                outcome_name: outcomeName.trim(),
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Call outcome added successfully',
            data: { id: result.insertId, outcome_name: outcomeName.trim() }
        });
    } catch (error) {
        console.error('Error adding call outcome:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Call outcome name already exists' });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllCallOutcomesController = async (req, res) => {
    try {
        const outcomes = await getAllCallOutcomes();
        res.status(200).json({
            success: true,
            message: 'Call outcomes retrieved successfully',
            data: outcomes
        });
    } catch (error) {
        console.error('Error retrieving call outcomes:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateCallOutcomeController = async (req, res) => {
    try {
        const { id } = req.params;
        const { outcomeName } = req.body;

        if (!outcomeName || !outcomeName.trim()) {
            return res.status(400).json({ success: false, message: 'Outcome name is required' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        const beforeData = await getCallOutcomeById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Call outcome not found' });
        }

        await updateCallOutcome(id, outcomeName.trim());
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Call Outcome Master',
            'updated',
            beforeData,
            {
                ...beforeData,
                outcome_name: outcomeName.trim()
            }
        );

        res.status(200).json({ success: true, message: 'Call outcome updated successfully' });
    } catch (error) {
        console.error('Error updating call outcome:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Call outcome name already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteCallOutcomeController = async (req, res) => {
    try {
        const { id } = req.params;
        const beforeData = await getCallOutcomeById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Call outcome not found' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        await deleteCallOutcome(id);
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Call Outcome Master',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({ success: true, message: 'Call outcome deleted successfully' });
    } catch (error) {
        console.error('Error deleting call outcome:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    addCallOutcomeController,
    getAllCallOutcomesController,
    updateCallOutcomeController,
    deleteCallOutcomeController
};
