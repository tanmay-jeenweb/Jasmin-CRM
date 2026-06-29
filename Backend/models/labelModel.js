const db = require('../config/db.js');

const createLabelsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS label_master (
            id INT AUTO_INCREMENT PRIMARY KEY,
            label_name VARCHAR(255) NOT NULL UNIQUE,
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    await db.execute(query);
    console.log("Label master table ready");
};

const createLabel = async (labelName, addedBy, deviceId) => {
    const query = `INSERT INTO label_master (label_name, added_by, device_id) VALUES (?, ?, ?)`;
    const [result] = await db.execute(query, [labelName, addedBy, deviceId]);
    return result;
};

const getAllLabels = async () => {
    const query = `
        SELECT
            lm.id,
            lm.label_name,
            COALESCE(u.name, 'Unknown') AS added_by_name,
            lm.device_id,
            lm.timestamp
        FROM label_master lm
        LEFT JOIN users u ON lm.added_by = u.id
        ORDER BY lm.timestamp DESC
    `;
    const [results] = await db.execute(query);
    return results;
};

const updateLabel = async (id, labelName) => {
    const query = `UPDATE label_master SET label_name = ? WHERE id = ?`;
    const [result] = await db.execute(query, [labelName, id]);
    return result;
};

const deleteLabel = async (id) => {
    const query = `DELETE FROM label_master WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
};

const getLabelById = async (id) => {
    const query = `
        SELECT id, label_name, added_by, device_id, timestamp 
        FROM label_master 
        WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

module.exports = {
    createLabelsTable,
    createLabel,
    getAllLabels,
    updateLabel,
    deleteLabel,
    getLabelById
};
