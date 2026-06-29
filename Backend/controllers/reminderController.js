const {
    createReminder,
    getRemindersByInquiry
} = require('../models/reminderModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addReminderController = async (req, res) => {
    try {
        const data = req.body;
        const userId = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!data.inquiryId) {
            return res.status(400).json({ success: false, message: 'Inquiry ID is required' });
        }
        if (!data.reminderText || !data.reminderText.trim()) {
            return res.status(400).json({ success: false, message: 'Reminder text is required' });
        }
        if (!data.reminderDate) {
            return res.status(400).json({ success: false, message: 'Reminder date is required' });
        }
        if (!data.reminderTime) {
            return res.status(400).json({ success: false, message: 'Reminder time is required' });
        }

        const result = await createReminder(data, userId);

        await createAuditLog(
            userId,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Reminder',
            'created',
            null,
            {
                id: result.insertId,
                inquiry_id: data.inquiryId,
                reminder_text: data.reminderText,
                reminder_date: data.reminderDate,
                reminder_time: data.reminderTime
            }
        );

        res.status(201).json({
            success: true,
            message: 'Reminder set successfully',
            data: { id: result.insertId, ...data }
        });
    } catch (error) {
        console.error('Error setting reminder:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getRemindersController = async (req, res) => {
    try {
        const { inquiryId } = req.params;
        const userId = req.user.id;

        if (!inquiryId) {
            return res.status(400).json({ success: false, message: 'Inquiry ID is required' });
        }

        const reminders = await getRemindersByInquiry(inquiryId, userId);

        res.status(200).json({
            success: true,
            message: 'Reminders retrieved successfully',
            data: reminders
        });
    } catch (error) {
        console.error('Error retrieving reminders:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    addReminderController,
    getRemindersController
};
