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

const getUnreadReminders = async (userId, userRole) => {
    const reminderQuery = `
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
    const [reminders] = await db.execute(reminderQuery, [userId]);

    // Fetch expiring franchise documents
    const docQuery = `
        SELECT 
            d.id AS document_id,
            d.doc_type,
            d.expiry_date,
            d.document_path,
            f.id AS in_process_franchise_id,
            f.partner_name,
            f.store_name,
            f.status AS franchise_status
        FROM in_process_franchise_documents d
        JOIN in_process_franchises f ON d.in_process_franchise_id = f.id
        LEFT JOIN document_expiry_notifications_read r 
            ON d.id = r.document_id AND r.user_id = ?
        WHERE d.expiry_date IS NOT NULL
          AND d.expiry_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 15 DAY)
          AND r.id IS NULL
          AND (? = 'admin' OR f.inquiry_manager_id = ? OR f.added_by = ?)
    `;
    const [docs] = await db.execute(docQuery, [userId, userRole || 'user', userId, userId]);

    const docNotifications = docs.map(doc => {
        const diffTime = new Date(doc.expiry_date) - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const franchiseLabel = doc.franchise_status === 'completed' ? 'franchise' : 'in-process franchise';
        let warningText = "";
        if (diffDays < 0) {
            warningText = `Document '${doc.doc_type}' for ${franchiseLabel} '${doc.partner_name}' expired on ${new Date(doc.expiry_date).toLocaleDateString()}`;
        } else if (diffDays === 0) {
            warningText = `Document '${doc.doc_type}' for ${franchiseLabel} '${doc.partner_name}' expires today!`;
        } else {
            warningText = `Document '${doc.doc_type}' for ${franchiseLabel} '${doc.partner_name}' is expiring in ${diffDays} days (${new Date(doc.expiry_date).toLocaleDateString()})`;
        }

        return {
            id: `doc-expiry-${doc.document_id}`,
            reminder_text: warningText,
            reminder_date: doc.expiry_date,
            reminder_time: "00:00:00",
            is_read: 0,
            in_process_franchise_id: doc.in_process_franchise_id,
            partner_name: doc.partner_name,
            franchise_status: doc.franchise_status,
            document_path: doc.document_path,
            is_document_expiry: true
        };
    });

    const combined = [...reminders, ...docNotifications];
    combined.sort((a, b) => {
        const dateA = new Date(a.reminder_date);
        const dateB = new Date(b.reminder_date);
        if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
        }
        return a.reminder_time.localeCompare(b.reminder_time);
    });

    return combined;
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

const markDocumentExpiryAsRead = async (documentId, userId) => {
    const query = `
        INSERT INTO document_expiry_notifications_read (document_id, user_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE timestamp = CURRENT_TIMESTAMP
    `;
    const [result] = await db.execute(query, [documentId, userId]);
    return result;
};

module.exports = {
    createRemindersTable,
    createReminder,
    getRemindersByInquiry,
    getUnreadReminders,
    markReminderAsRead,
    markDocumentExpiryAsRead
};

