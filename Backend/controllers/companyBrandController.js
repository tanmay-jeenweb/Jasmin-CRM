const {
    createCompanyBrand,
    getAllCompanyBrands,
    updateCompanyBrand,
    deleteCompanyBrand,
    getCompanyBrandById
} = require('../models/companyBrandModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addCompanyBrandController = async (req, res) => {
    try {
        const { brandName } = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!brandName || !brandName.trim()) {
            return res.status(400).json({ success: false, message: 'Brand name is required' });
        }

        const result = await createCompanyBrand(brandName.trim(), addedBy, deviceId);
        
        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Company Brand Master',
            'created',
            null,
            {
                id: result.insertId,
                brand_name: brandName.trim(),
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Company brand added successfully',
            data: { id: result.insertId, brand_name: brandName.trim() }
        });
    } catch (error) {
        console.error('Error adding company brand:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Brand name already exists' });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllCompanyBrandsController = async (req, res) => {
    try {
        const brands = await getAllCompanyBrands();
        res.status(200).json({
            success: true,
            message: 'Company brands retrieved successfully',
            data: brands
        });
    } catch (error) {
        console.error('Error retrieving company brands:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateCompanyBrandController = async (req, res) => {
    try {
        const { id } = req.params;
        const { brandName } = req.body;

        if (!brandName || !brandName.trim()) {
            return res.status(400).json({ success: false, message: 'Brand name is required' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        const beforeData = await getCompanyBrandById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Company brand not found' });
        }

        await updateCompanyBrand(id, brandName.trim());
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Company Brand Master',
            'updated',
            beforeData,
            {
                ...beforeData,
                brand_name: brandName.trim()
            }
        );

        res.status(200).json({ success: true, message: 'Company brand updated successfully' });
    } catch (error) {
        console.error('Error updating company brand:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Brand name already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteCompanyBrandController = async (req, res) => {
    try {
        const { id } = req.params;
        const beforeData = await getCompanyBrandById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Company brand not found' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        await deleteCompanyBrand(id);
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Company Brand Master',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({ success: true, message: 'Company brand deleted successfully' });
    } catch (error) {
        console.error('Error deleting company brand:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    addCompanyBrandController,
    getAllCompanyBrandsController,
    updateCompanyBrandController,
    deleteCompanyBrandController
};
