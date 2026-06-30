const {
    createInProcessFranchise,
    getAllInProcessFranchises,
    updateInProcessFranchise,
    deleteInProcessFranchise,
    getInProcessFranchiseById
} = require('../models/inProcessFranchiseModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addInProcessFranchiseController = async (req, res) => {
    try {
        const data = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Validation
        if (!data.partnerName || !data.partnerName.trim()) {
            return res.status(400).json({ success: false, message: 'Partner Name is required' });
        }
        if (!data.partnerMobile || !data.partnerMobile.trim()) {
            return res.status(400).json({ success: false, message: 'Partner Mobile is required' });
        }
        if (!data.partnerEmail || !data.partnerEmail.trim()) {
            return res.status(400).json({ success: false, message: 'Partner Email is required' });
        }
        if (!data.city || !data.city.trim()) {
            return res.status(400).json({ success: false, message: 'City is required' });
        }
        if (!data.district || !data.district.trim()) {
            return res.status(400).json({ success: false, message: 'District is required' });
        }
        if (!data.state || !data.state.trim()) {
            return res.status(400).json({ success: false, message: 'State is required' });
        }
        if (!data.tentativeOpeningDate) {
            return res.status(400).json({ success: false, message: 'Tentative Opening Date is required' });
        }
        if (!data.bdmArea || !data.bdmArea.trim()) {
            return res.status(400).json({ success: false, message: 'BDM Area is required' });
        }
        if (!data.inquiryManagerId) {
            return res.status(400).json({ success: false, message: 'Inquiry Manager is required' });
        }
        if (!data.storeName) {
            return res.status(400).json({ success: false, message: 'Store Name is required' });
        }

        const result = await createInProcessFranchise(data, addedBy, deviceId);

        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise',
            'created',
            null,
            {
                id: result.insertId,
                partner_name: data.partnerName,
                partner_mobile: data.partnerMobile,
                store_name: data.storeName
            }
        );

        res.status(201).json({
            success: true,
            message: 'In Process Franchise created successfully',
            data: { id: result.insertId, ...data }
        });
    } catch (error) {
        console.error('Error adding in process franchise:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllInProcessFranchisesController = async (req, res) => {
    try {
        const franchises = await getAllInProcessFranchises();
        res.status(200).json({
            success: true,
            message: 'In Process Franchises retrieved successfully',
            data: franchises
        });
    } catch (error) {
        console.error('Error retrieving in process franchises:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateInProcessFranchiseController = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Validation
        if (!data.partnerName || !data.partnerName.trim()) {
            return res.status(400).json({ success: false, message: 'Partner Name is required' });
        }
        if (!data.partnerMobile || !data.partnerMobile.trim()) {
            return res.status(400).json({ success: false, message: 'Partner Mobile is required' });
        }
        if (!data.partnerEmail || !data.partnerEmail.trim()) {
            return res.status(400).json({ success: false, message: 'Partner Email is required' });
        }
        if (!data.city || !data.city.trim()) {
            return res.status(400).json({ success: false, message: 'City is required' });
        }
        if (!data.district || !data.district.trim()) {
            return res.status(400).json({ success: false, message: 'District is required' });
        }
        if (!data.state || !data.state.trim()) {
            return res.status(400).json({ success: false, message: 'State is required' });
        }
        if (!data.tentativeOpeningDate) {
            return res.status(400).json({ success: false, message: 'Tentative Opening Date is required' });
        }
        if (!data.bdmArea || !data.bdmArea.trim()) {
            return res.status(400).json({ success: false, message: 'BDM Area is required' });
        }
        if (!data.inquiryManagerId) {
            return res.status(400).json({ success: false, message: 'Inquiry Manager is required' });
        }
        if (!data.storeName) {
            return res.status(400).json({ success: false, message: 'Store Name is required' });
        }

        const beforeData = await getInProcessFranchiseById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        await updateInProcessFranchise(id, data);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise',
            'updated',
            beforeData,
            { id, ...data }
        );

        res.status(200).json({
            success: true,
            message: 'In Process Franchise updated successfully'
        });
    } catch (error) {
        console.error('Error updating in process franchise:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deleteInProcessFranchiseController = async (req, res) => {
    try {
        const { id } = req.params;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const beforeData = await getInProcessFranchiseById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        await deleteInProcessFranchise(id);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({
            success: true,
            message: 'In Process Franchise deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting in process franchise:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getInProcessFranchiseByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }
        res.status(200).json({
            success: true,
            message: 'In Process Franchise retrieved successfully',
            data: franchise
        });
    } catch (error) {
        console.error('Error retrieving in process franchise by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    addInProcessFranchiseController,
    getAllInProcessFranchisesController,
    updateInProcessFranchiseController,
    deleteInProcessFranchiseController,
    getInProcessFranchiseByIdController
};
