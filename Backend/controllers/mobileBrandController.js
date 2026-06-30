const {
    createMobileBrand,
    getAllMobileBrands,
    updateMobileBrand,
    deleteMobileBrand,
    getMobileBrandById
} = require('../models/mobileBrandModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addMobileBrandController = async (req, res) => {
    try {
        const { mobileBrand } = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!mobileBrand || !mobileBrand.trim()) {
            return res.status(400).json({ success: false, message: 'Mobile brand is required' });
        }

        const result = await createMobileBrand(mobileBrand.trim(), addedBy, deviceId);
        
        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Mobile Brand Master',
            'created',
            null,
            {
                id: result.insertId,
                mobile_brand: mobileBrand.trim(),
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Mobile brand added successfully',
            data: { id: result.insertId, mobile_brand: mobileBrand.trim() }
        });
    } catch (error) {
        console.error('Error adding mobile brand:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Mobile brand already exists' });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllMobileBrandsController = async (req, res) => {
    try {
        const brands = await getAllMobileBrands();
        res.status(200).json({
            success: true,
            message: 'Mobile brands retrieved successfully',
            data: brands
        });
    } catch (error) {
        console.error('Error retrieving mobile brands:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateMobileBrandController = async (req, res) => {
    try {
        const { id } = req.params;
        const { mobileBrand } = req.body;

        if (!mobileBrand || !mobileBrand.trim()) {
            return res.status(400).json({ success: false, message: 'Mobile brand is required' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        const beforeData = await getMobileBrandById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Mobile brand not found' });
        }

        await updateMobileBrand(id, mobileBrand.trim());
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Mobile Brand Master',
            'updated',
            beforeData,
            {
                ...beforeData,
                mobile_brand: mobileBrand.trim()
            }
        );

        res.status(200).json({ success: true, message: 'Mobile brand updated successfully' });
    } catch (error) {
        console.error('Error updating mobile brand:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Mobile brand already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteMobileBrandController = async (req, res) => {
    try {
        const { id } = req.params;
        const beforeData = await getMobileBrandById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Mobile brand not found' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        await deleteMobileBrand(id);
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Mobile Brand Master',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({ success: true, message: 'Mobile brand deleted successfully' });
    } catch (error) {
        console.error('Error deleting mobile brand:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    addMobileBrandController,
    getAllMobileBrandsController,
    updateMobileBrandController,
    deleteMobileBrandController
};
