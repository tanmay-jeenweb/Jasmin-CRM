const db = require('../config/db.js');

const createInquiriesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS inquiries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(255) NOT NULL,
            state VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            district VARCHAR(255) NOT NULL,
            current_occupation VARCHAR(255) NOT NULL,
            field_of_occupation VARCHAR(255) NOT NULL,
            business_location VARCHAR(50) NOT NULL,
            inquiry_source VARCHAR(255) NOT NULL,
            min_budget DECIMAL(15, 2) NOT NULL,
            max_budget DECIMAL(15, 2) NOT NULL,
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            status VARCHAR(50) NOT NULL DEFAULT 'inquiry',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("Inquiries table ready");

    // Check if label_id column exists, if not add it
    try {
        const checkColumnQuery = `SHOW COLUMNS FROM inquiries LIKE 'label_id'`;
        const [columns] = await db.query(checkColumnQuery);
        if (columns.length === 0) {
            const addColumnQuery = `
                ALTER TABLE inquiries 
                ADD COLUMN label_id INT NULL,
                ADD FOREIGN KEY (label_id) REFERENCES label_master(id) ON DELETE SET NULL;
            `;
            await db.query(addColumnQuery);
            console.log("Inquiries table updated with label_id column.");
        }
    } catch (err) {
        console.error("Error checking/adding label_id column:", err);
    }

    // Check if status column exists, if not add it
    try {
        const checkColumnQuery = `SHOW COLUMNS FROM inquiries LIKE 'status'`;
        const [columns] = await db.query(checkColumnQuery);
        if (columns.length === 0) {
            const addColumnQuery = `
                ALTER TABLE inquiries 
                ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'inquiry';
            `;
            await db.query(addColumnQuery);
            console.log("Inquiries table updated with status column.");
        }
    } catch (err) {
        console.error("Error checking/adding status column:", err);
    }

    // Check if inquiry_source_detail column exists, if not add it
    try {
        const checkColumnQuery = `SHOW COLUMNS FROM inquiries LIKE 'inquiry_source_detail'`;
        const [columns] = await db.query(checkColumnQuery);
        if (columns.length === 0) {
            const addColumnQuery = `
                ALTER TABLE inquiries 
                ADD COLUMN inquiry_source_detail VARCHAR(255) NULL;
            `;
            await db.query(addColumnQuery);
            console.log("Inquiries table updated with inquiry_source_detail column.");
        }
    } catch (err) {
        console.error("Error checking/adding inquiry_source_detail column:", err);
    }

    // Check if close_reason column exists, if not add it
    try {
        const checkColumnQuery = `SHOW COLUMNS FROM inquiries LIKE 'close_reason'`;
        const [columns] = await db.query(checkColumnQuery);
        if (columns.length === 0) {
            const addColumnQuery = `
                ALTER TABLE inquiries 
                ADD COLUMN close_reason VARCHAR(255) NULL;
            `;
            await db.query(addColumnQuery);
            console.log("Inquiries table updated with close_reason column.");
        }
    } catch (err) {
        console.error("Error checking/adding close_reason column:", err);
    }
};

const createInquiry = async (data, addedBy, deviceId) => {
    const query = `
        INSERT INTO inquiries (
            name, email, phone, state, city, district, 
            current_occupation, field_of_occupation, 
            business_location, inquiry_source, inquiry_source_detail, min_budget, max_budget, 
            added_by, device_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
        data.name,
        data.email,
        data.phone,
        data.state,
        data.city,
        data.district,
        data.currentOccupation,
        data.fieldOfOccupation,
        data.businessLocation,
        data.inquirySource,
        data.inquirySourceDetail || null,
        data.minBudget,
        data.maxBudget,
        addedBy,
        deviceId
    ]);
    return result;
};

const getAllInquiries = async (userId = null, userRole = null) => {
    let whereClause = "WHERE i.status = 'inquiry'";
    const params = [];
    
    if (userRole !== 'admin' && userRole !== 'super admin' && userRole !== 'office staff') {
        whereClause += " AND i.added_by = ?";
        params.push(userId);
    }

    const query = `
        SELECT 
            i.*,
            COALESCE(u.name, 'Unknown') AS added_by_name,
            lm.label_name
        FROM inquiries i
        LEFT JOIN users u ON i.added_by = u.id
        LEFT JOIN label_master lm ON i.label_id = lm.id
        ${whereClause}
        ORDER BY i.timestamp DESC
    `;
    const [results] = await db.execute(query, params);
    return results;
};

const updateInquiry = async (id, data) => {
    const query = `
        UPDATE inquiries SET 
            name = ?, 
            email = ?, 
            phone = ?, 
            state = ?, 
            city = ?, 
            district = ?, 
            current_occupation = ?, 
            field_of_occupation = ?, 
            business_location = ?, 
            inquiry_source = ?, 
            inquiry_source_detail = ?, 
            min_budget = ?, 
            max_budget = ?
        WHERE id = ?
    `;
    const [result] = await db.execute(query, [
        data.name,
        data.email,
        data.phone,
        data.state,
        data.city,
        data.district,
        data.currentOccupation,
        data.fieldOfOccupation,
        data.businessLocation,
        data.inquirySource,
        data.inquirySourceDetail || null,
        data.minBudget,
        data.maxBudget,
        id
    ]);
    return result;
};

const updateInquiryLabel = async (id, labelId) => {
    const query = `UPDATE inquiries SET label_id = ? WHERE id = ?`;
    const [result] = await db.execute(query, [labelId, id]);
    return result;
};

const updateInquiryStatus = async (id, status, reason = null) => {
    let query;
    let params;
    if (status === 'closed') {
        query = `UPDATE inquiries SET status = ?, close_reason = ? WHERE id = ?`;
        params = [status, reason, id];
    } else {
        query = `UPDATE inquiries SET status = ? WHERE id = ?`;
        params = [status, id];
    }
    const [result] = await db.execute(query, params);
    return result;
};

const getInquiryById = async (id) => {
    const query = `
        SELECT i.*, lm.label_name 
        FROM inquiries i 
        LEFT JOIN label_master lm ON i.label_id = lm.id 
        WHERE i.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

module.exports = {
    createInquiriesTable,
    createInquiry,
    getAllInquiries,
    updateInquiry,
    updateInquiryLabel,
    updateInquiryStatus,
    getInquiryById
};
