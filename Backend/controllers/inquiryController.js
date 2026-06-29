const {
    createInquiry,
    getAllInquiries
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
        if (!data.minBudget || Number(data.minBudget) < 1000000) {
            return res.status(400).json({ success: false, message: 'Minimum Budget must not be less than 1,000,000' });
        }
        if (!data.maxBudget || Number(data.maxBudget) < 5000000) {
            return res.status(400).json({ success: false, message: 'Maximum Budget must not be less than 5,000,000' });
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
        const inquiries = await getAllInquiries();
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

module.exports = {
    addInquiryController,
    getAllInquiriesController
};
