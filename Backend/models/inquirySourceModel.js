const db = require('../config/db.js');

const createInquirySourcesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS inquiry_source_master (
            id INT AUTO_INCREMENT PRIMARY KEY,
            source_name VARCHAR(255) NOT NULL UNIQUE,
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    await db.execute(query);
    console.log("Inquiry source master table ready");
};

const createInquirySource = async (sourceName, addedBy, deviceId) => {
    const query = `INSERT INTO inquiry_source_master (source_name, added_by, device_id) VALUES (?, ?, ?)`;
    const [result] = await db.execute(query, [sourceName, addedBy, deviceId]);
    return result;
};

const getAllInquirySources = async () => {
    const query = `
        SELECT
            ism.id,
            ism.source_name,
            COALESCE(u.name, 'Unknown') AS added_by_name,
            ism.device_id,
            ism.timestamp
        FROM inquiry_source_master ism
        LEFT JOIN users u ON ism.added_by = u.id
        ORDER BY ism.timestamp DESC
    `;
    const [results] = await db.execute(query);
    return results;
};

const updateInquirySource = async (id, sourceName) => {
    const query = `UPDATE inquiry_source_master SET source_name = ? WHERE id = ?`;
    const [result] = await db.execute(query, [sourceName, id]);
    return result;
};

const deleteInquirySource = async (id) => {
    const query = `DELETE FROM inquiry_source_master WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
};

const getInquirySourceById = async (id) => {
    const query = `
        SELECT id, source_name, added_by, device_id, timestamp 
        FROM inquiry_source_master 
        WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

module.exports = {
    createInquirySourcesTable,
    createInquirySource,
    getAllInquirySources,
    updateInquirySource,
    deleteInquirySource,
    getInquirySourceById
};
