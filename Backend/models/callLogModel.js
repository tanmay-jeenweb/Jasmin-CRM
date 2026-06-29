const db = require('../config/db.js');

const createCallLogsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS call_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inquiry_id INT NOT NULL,
            user_id INT NOT NULL,
            call_outcome VARCHAR(100) NOT NULL,
            call_date DATE NOT NULL,
            call_time TIME NOT NULL,
            description TEXT,
            reminder_id INT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);

    // Add reminder_id column if it doesn't exist
    try {
        await db.execute(`
            ALTER TABLE call_logs 
            ADD COLUMN reminder_id INT NULL,
            ADD CONSTRAINT fk_call_logs_reminder FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE SET NULL
        `);
        console.log("Call Logs table updated with reminder_id column.");
    } catch (err) {
        // Column and constraint likely already exist
    }
};

const createCallLog = async (data, userId, reminderId = null) => {
    const query = `
        INSERT INTO call_logs (
            inquiry_id, user_id, call_outcome, call_date, call_time, description, reminder_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
        data.inquiryId,
        userId,
        data.callOutcome,
        data.callDate,
        data.callTime,
        data.description,
        reminderId
    ]);
    return result;
};

const getCallLogsByInquiry = async (inquiryId, userId) => {
    const query = `
        SELECT 
            cl.*,
            u.name AS user_name,
            r.reminder_text,
            r.reminder_date,
            r.reminder_time
        FROM call_logs cl
        LEFT JOIN users u ON cl.user_id = u.id
        LEFT JOIN reminders r ON cl.reminder_id = r.id
        WHERE cl.inquiry_id = ? AND cl.user_id = ?
        ORDER BY cl.call_date DESC, cl.call_time DESC, cl.timestamp DESC
    `;
    const [results] = await db.execute(query, [inquiryId, userId]);
    return results;
};

module.exports = {
    createCallLogsTable,
    createCallLog,
    getCallLogsByInquiry
};
