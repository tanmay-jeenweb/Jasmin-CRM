const {
    createBank,
    getAllBanks,
    updateBank,
    deleteBank,
    getBankById
} = require('../models/bankModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addBankController = async (req, res) => {
    try {
        const { bankCardName } = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!bankCardName || !bankCardName.trim()) {
            return res.status(400).json({ success: false, message: 'Bank/Card name is required' });
        }

        const result = await createBank(bankCardName.trim(), addedBy, deviceId);
        
        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Bank Master',
            'created',
            null,
            {
                id: result.insertId,
                bank_card_name: bankCardName.trim(),
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Bank/Card added successfully',
            data: { id: result.insertId, bank_card_name: bankCardName.trim() }
        });
    } catch (error) {
        console.error('Error adding bank/card:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Bank/Card name already exists' });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllBanksController = async (req, res) => {
    try {
        const banks = await getAllBanks();
        res.status(200).json({
            success: true,
            message: 'Banks retrieved successfully',
            data: banks
        });
    } catch (error) {
        console.error('Error retrieving banks:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateBankController = async (req, res) => {
    try {
        const { id } = req.params;
        const { bankCardName } = req.body;

        if (!bankCardName || !bankCardName.trim()) {
            return res.status(400).json({ success: false, message: 'Bank/Card name is required' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        const beforeData = await getBankById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Bank/Card not found' });
        }

        await updateBank(id, bankCardName.trim());
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Bank Master',
            'updated',
            beforeData,
            {
                ...beforeData,
                bank_card_name: bankCardName.trim()
            }
        );

        res.status(200).json({ success: true, message: 'Bank/Card updated successfully' });
    } catch (error) {
        console.error('Error updating bank/card:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Bank/Card name already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteBankController = async (req, res) => {
    try {
        const { id } = req.params;
        const beforeData = await getBankById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Bank/Card not found' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        await deleteBank(id);
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Bank Master',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({ success: true, message: 'Bank/Card deleted successfully' });
    } catch (error) {
        console.error('Error deleting bank/card:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    addBankController,
    getAllBanksController,
    updateBankController,
    deleteBankController
};
