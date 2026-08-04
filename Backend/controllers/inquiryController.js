const {
    createInquiry,
    getAllInquiries,
    updateInquiry,
    updateInquiryLabel,
    updateInquiryStatus,
    getInquiryById
} = require('../models/inquiryModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addInquiryController = async (req, res) => {
    try {
        const data = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Validation checks
        if (!data.name || !data.name.trim()) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }
        if (!data.email || !data.email.trim()) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        if (!data.phone || !data.phone.trim()) {
            return res.status(400).json({ success: false, message: 'Phone is required' });
        }
        if (!data.minBudget || Number(data.minBudget) < 50000) {
            return res.status(400).json({ success: false, message: 'Budget must not be less than 50,000' });
        }
        if (data.inquirySource) {
            const sourceLower = data.inquirySource.toLowerCase();
            if (['employee', 'franchisie', 'social media'].includes(sourceLower)) {
                if (!data.inquirySourceDetail || !data.inquirySourceDetail.trim()) {
                    return res.status(400).json({ success: false, message: `Inquiry source detail is required for source: ${data.inquirySource}` });
                }
            }
        }

        const result = await createInquiry(data, addedBy, deviceId);

        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Inquiry',
            'created',
            null,
            {
                id: result.insertId,
                name: data.name.trim(),
                email: data.email.trim(),
                phone: data.phone.trim(),
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Inquiry added successfully',
            data: { id: result.insertId, ...data }
        });
    } catch (error) {
        console.error('Error adding inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllInquiriesController = async (req, res) => {
    try {
        const inquiries = await getAllInquiries(req.user.id, req.user.role);
        res.status(200).json({
            success: true,
            message: 'Inquiries retrieved successfully',
            data: inquiries
        });
    } catch (error) {
        console.error('Error retrieving inquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateInquiryController = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Validation checks
        if (!data.name || !data.name.trim()) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }
        if (!data.email || !data.email.trim()) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        if (!data.phone || !data.phone.trim()) {
            return res.status(400).json({ success: false, message: 'Phone is required' });
        }
        if (!data.minBudget || Number(data.minBudget) < 50000) {
            return res.status(400).json({ success: false, message: 'Budget must not be less than 50,000' });
        }
        if (data.inquirySource) {
            const sourceLower = data.inquirySource.toLowerCase();
            if (['employee', 'franchisie', 'social media'].includes(sourceLower)) {
                if (!data.inquirySourceDetail || !data.inquirySourceDetail.trim()) {
                    return res.status(400).json({ success: false, message: `Inquiry source detail is required for source: ${data.inquirySource}` });
                }
            }
        }

        const beforeData = await getInquiryById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        if (req.user.role !== 'admin' && req.user.role !== 'super admin' && beforeData.added_by !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied. You do not own this inquiry.' });
        }

        await updateInquiry(id, data);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Inquiry',
            'updated',
            beforeData,
            { id, ...data }
        );

        res.status(200).json({
            success: true,
            message: 'Inquiry updated successfully'
        });
    } catch (error) {
        console.error('Error updating inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateInquiryLabelController = async (req, res) => {
    try {
        const { id } = req.params;
        const { labelId } = req.body;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const beforeData = await getInquiryById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        if (req.user.role !== 'admin' && req.user.role !== 'super admin' && beforeData.added_by !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied. You do not own this inquiry.' });
        }

        await updateInquiryLabel(id, labelId);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Inquiry',
            'label_updated',
            beforeData,
            { id, label_id: labelId }
        );

        res.status(200).json({
            success: true,
            message: 'Inquiry label updated successfully'
        });
    } catch (error) {
        console.error('Error updating inquiry label:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateInquiryStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const beforeData = await getInquiryById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        if (req.user.role !== 'admin' && req.user.role !== 'super admin' && beforeData.added_by !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied. You do not own this inquiry.' });
        }

        await updateInquiryStatus(id, status, reason);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Inquiry',
            'status_updated',
            beforeData,
            { id, status, close_reason: reason || null }
        );

        res.status(200).json({
            success: true,
            message: 'Inquiry status updated successfully'
        });
    } catch (error) {
        console.error('Error updating inquiry status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    addInquiryController,
    getAllInquiriesController,
    updateInquiryController,
    updateInquiryLabelController,
    updateInquiryStatusController
};
