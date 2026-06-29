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
            is_read TINYINT(1) NOT NULL DEFAULT 0,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);

    // Attempt to add is_read column in case the table already existed
    try {
        await db.execute(`
            ALTER TABLE reminders 
            ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0
        `);
        console.log("Added column is_read to reminders table");
    } catch (err) {
        // Ignore duplicate column name error (1060)
        if (err.errno !== 1060 && !err.message.includes("Duplicate column name")) {
            console.error("Error altering reminders table:", err.message);
        }
    }

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

const getUnreadReminders = async (userId) => {
    const query = `
        SELECT 
            r.*,
            i.name AS inquiry_name,
            i.phone AS inquiry_phone,
            i.email AS inquiry_email
        FROM reminders r
        LEFT JOIN inquiries i ON r.inquiry_id = i.id
        WHERE r.user_id = ? 
          AND r.is_read = 0 
          AND (
            r.reminder_date < CURRENT_DATE() 
            OR (r.reminder_date = CURRENT_DATE() AND r.reminder_time <= CURRENT_TIME())
          )
        ORDER BY r.reminder_date ASC, r.reminder_time ASC
    `;
    const [results] = await db.execute(query, [userId]);
    return results;
};

const markReminderAsRead = async (reminderId, userId) => {
    const query = `
        UPDATE reminders
        SET is_read = 1
        WHERE id = ? AND user_id = ?
    `;
    const [result] = await db.execute(query, [reminderId, userId]);
    return result;
};

module.exports = {
    createRemindersTable,
    createReminder,
    getRemindersByInquiry,
    getUnreadReminders,
    markReminderAsRead
};

