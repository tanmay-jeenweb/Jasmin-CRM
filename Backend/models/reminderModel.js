const db = require('../config/db.js');

const createRemindersTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS reminders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inquiry_id INT NOT NULL,
            user_id INT NOT NULL,
            reminder_text TEXT NOT NULL,
            reminder_date DATE NOT NULL,
            reminder_time TIME NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("Reminders table ready");
};

const createReminder = async (data, userId) => {
    const query = `
        INSERT INTO reminders (
            inquiry_id, user_id, reminder_text, reminder_date, reminder_time
        ) VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
        data.inquiryId,
        userId,
        data.reminderText,
        data.reminderDate,
        data.reminderTime
    ]);
    return result;
};

const getRemindersByInquiry = async (inquiryId, userId) => {
    const query = `
        SELECT 
            r.*,
            u.name AS user_name
        FROM reminders r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.inquiry_id = ? AND r.user_id = ?
        ORDER BY r.reminder_date ASC, r.reminder_time ASC, r.timestamp DESC
    `;
    const [results] = await db.execute(query, [inquiryId, userId]);
    return results;
};

module.exports = {
    createRemindersTable,
    createReminder,
    getRemindersByInquiry
};
