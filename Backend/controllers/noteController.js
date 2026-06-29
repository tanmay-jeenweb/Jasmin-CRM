const db = require("../config/db.js");
const { createAuditLog } = require("../models/auditLogModel.js");

const addNoteController = async (req, res) => {
    const { inquiryId, noteText } = req.body;
    const userId = req.user.id;
    const username = req.user?.name || req.user?.username || 'Unknown';
    const deviceId = req.headers["x-device-id"] || "Unknown";

    if (!inquiryId || !noteText) {
        return res.status(400).json({
            success: false,
            message: "Inquiry ID and note text are required."
        });
    }

    try {
        // Insert note
        const insertQuery = `
            INSERT INTO notes (inquiry_id, user_id, note_text, created_by_device_id)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(insertQuery, [inquiryId, userId, noteText, deviceId]);

        // Audit Logging
        await createAuditLog(
            userId,
            username,
            deviceId,
            "Note",
            "created",
            null,
            {
                id: result.insertId,
                inquiry_id: inquiryId,
                note_text: noteText
            }
        );

        return res.status(201).json({
            success: true,
            message: "Note added successfully.",
            data: {
                id: result.insertId,
                inquiry_id: inquiryId,
                user_id: userId,
                note_text: noteText,
                created_by_device_id: deviceId
            }
        });
    } catch (err) {
        console.error("Error in addNoteController:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while adding note."
        });
    }
};

const getNotesController = async (req, res) => {
    const { inquiryId } = req.params;
    const userId = req.user.id;

    if (!inquiryId) {
        return res.status(400).json({
            success: false,
            message: "Inquiry ID is required."
        });
    }

    try {
        const selectQuery = `
            SELECT id, inquiry_id, user_id, note_text, timestamp
            FROM notes
            WHERE inquiry_id = ? AND user_id = ?
            ORDER BY timestamp DESC
        `;
        const [rows] = await db.query(selectQuery, [inquiryId, userId]);

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (err) {
        console.error("Error in getNotesController:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching notes."
        });
    }
};

module.exports = {
    addNoteController,
    getNotesController
};
