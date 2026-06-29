const {
    createCallLog,
    getCallLogsByInquiry
} = require('../models/callLogModel.js');
const { createReminder } = require('../models/reminderModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addCallLogController = async (req, res) => {
    try {
        const data = req.body;
        const userId = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!data.inquiryId) {
            return res.status(400).json({ success: false, message: 'Inquiry ID is required' });
        }
        if (!data.callOutcome || !data.callOutcome.trim()) {
            return res.status(400).json({ success: false, message: 'Call outcome is required' });
        }
        if (!data.callDate) {
            return res.status(400).json({ success: false, message: 'Call date is required' });
        }
        if (!data.callTime) {
            return res.status(400).json({ success: false, message: 'Call time is required' });
        }

        // Optional reminder creation
        let reminderId = null;
        if (data.setReminder && data.reminderText && data.reminderText.trim()) {
            if (!data.reminderDate || !data.reminderTime) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Reminder date and time are required when setting a reminder' 
                });
            }

            const reminderResult = await createReminder({
                inquiryId: data.inquiryId,
                reminderText: data.reminderText,
                reminderDate: data.reminderDate,
                reminderTime: data.reminderTime
            }, userId);

            reminderId = reminderResult.insertId;

            // Log audit log for reminder
            await createAuditLog(
                userId,
                req.user?.name || req.user?.username || 'Unknown',
                deviceId,
                'Reminder',
                'created',
                null,
                {
                    id: reminderId,
                    inquiry_id: data.inquiryId,
                    reminder_text: data.reminderText,
                    reminder_date: data.reminderDate,
                    reminder_time: data.reminderTime
                }
            );
        }

        const result = await createCallLog(data, userId, reminderId);

        await createAuditLog(
            userId,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'CallLog',
            'created',
            null,
            {
                id: result.insertId,
                inquiry_id: data.inquiryId,
                call_outcome: data.callOutcome,
                call_date: data.callDate,
                call_time: data.callTime,
                reminder_id: reminderId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Call log added successfully',
            data: { id: result.insertId, ...data, reminderId }
        });
    } catch (error) {
        console.error('Error adding call log:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getCallLogsController = async (req, res) => {
    try {
        const { inquiryId } = req.params;
        const userId = req.user.id;

        if (!inquiryId) {
            return res.status(400).json({ success: false, message: 'Inquiry ID is required' });
        }

        const logs = await getCallLogsByInquiry(inquiryId, userId);

        res.status(200).json({
            success: true,
            message: 'Call logs retrieved successfully',
            data: logs
        });
    } catch (error) {
        console.error('Error retrieving call logs:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    addCallLogController,
    getCallLogsController
};
