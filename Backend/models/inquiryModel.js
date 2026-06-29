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
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("Inquiries table ready");
};

const createInquiry = async (data, addedBy, deviceId) => {
    const query = `
        INSERT INTO inquiries (
            name, email, phone, state, city, district, 
            current_occupation, field_of_occupation, 
            business_location, inquiry_source, min_budget, max_budget, 
            added_by, device_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        data.minBudget,
        data.maxBudget,
        addedBy,
        deviceId
    ]);
    return result;
};

const getAllInquiries = async () => {
    const query = `
        SELECT 
            i.*,
            COALESCE(u.name, 'Unknown') AS added_by_name
        FROM inquiries i
        LEFT JOIN users u ON i.added_by = u.id
        ORDER BY i.timestamp DESC
    `;
    const [results] = await db.execute(query);
    return results;
};

module.exports = {
    createInquiriesTable,
    createInquiry,
    getAllInquiries
};
