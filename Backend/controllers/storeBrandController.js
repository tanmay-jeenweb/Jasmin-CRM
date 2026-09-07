const {
    createStoreBrand,
    getAllStoreBrands,
    updateStoreBrand,
    deleteStoreBrand,
    getStoreBrandById
} = require('../models/storeBrandModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addStoreBrandController = async (req, res) => {
    try {
        const { name, forCode } = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Store brand name is required' });
        }

        const formattedForCode = forCode === 'Yes' ? 'Yes' : 'No';
        const result = await createStoreBrand(name.trim(), formattedForCode, addedBy, deviceId);
        
        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Store Brand Master',
            'created',
            null,
            {
                id: result.insertId,
                name: name.trim(),
                for_code: formattedForCode,
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Store brand added successfully',
            data: { id: result.insertId, name: name.trim(), for_code: formattedForCode }
        });
    } catch (error) {
        console.error('Error adding store brand:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Store brand already exists' });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllStoreBrandsController = async (req, res) => {
    try {
        const brands = await getAllStoreBrands();
        res.status(200).json({
            success: true,
            message: 'Store brands retrieved successfully',
            data: brands
        });
    } catch (error) {
        console.error('Error retrieving store brands:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateStoreBrandController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, forCode } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Store brand name is required' });
        }

        const formattedForCode = forCode === 'Yes' ? 'Yes' : 'No';
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        const beforeData = await getStoreBrandById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Store brand not found' });
        }

        await updateStoreBrand(id, name.trim(), formattedForCode);
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Store Brand Master',
            'updated',
            beforeData,
            {
                ...beforeData,
                name: name.trim(),
                for_code: formattedForCode
            }
        );

        res.status(200).json({ success: true, message: 'Store brand updated successfully' });
    } catch (error) {
        console.error('Error updating store brand:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Store brand already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteStoreBrandController = async (req, res) => {
    try {
        const { id } = req.params;
        const beforeData = await getStoreBrandById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Store brand not found' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        await deleteStoreBrand(id);
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Store Brand Master',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({ success: true, message: 'Store brand deleted successfully' });
    } catch (error) {
        console.error('Error deleting store brand:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    addStoreBrandController,
    getAllStoreBrandsController,
    updateStoreBrandController,
    deleteStoreBrandController
};
