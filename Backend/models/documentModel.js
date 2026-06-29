const db = require('../config/db.js');

const createDocumentsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS document_master (
            id INT AUTO_INCREMENT PRIMARY KEY,
            doc_type VARCHAR(255) NOT NULL UNIQUE,
            is_required TINYINT(1) DEFAULT 0,
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    await db.execute(query);
    console.log("Document master table ready");
};

const createDocument = async (docType, isRequired, addedBy, deviceId) => {
    const query = `INSERT INTO document_master (doc_type, is_required, added_by, device_id) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(query, [docType, isRequired ? 1 : 0, addedBy, deviceId]);
    return result;
};

const getAllDocuments = async () => {
    const query = `
        SELECT
            dm.id,
            dm.doc_type,
            dm.is_required,
            COALESCE(u.name, 'Unknown') AS added_by_name,
            dm.device_id,
            dm.timestamp
        FROM document_master dm
        LEFT JOIN users u ON dm.added_by = u.id
        ORDER BY dm.timestamp DESC
    `;
    const [results] = await db.execute(query);
    return results;
};

const updateDocument = async (id, docType, isRequired) => {
    const query = `UPDATE document_master SET doc_type = ?, is_required = ? WHERE id = ?`;
    const [result] = await db.execute(query, [docType, isRequired ? 1 : 0, id]);
    return result;
};

const deleteDocument = async (id) => {
    const query = `DELETE FROM document_master WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
};

const getDocumentById = async (id) => {
    const query = `
        SELECT id, doc_type, is_required, added_by, device_id, timestamp 
        FROM document_master 
        WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

module.exports = {
    createDocumentsTable,
    createDocument,
    getAllDocuments,
    updateDocument,
    deleteDocument,
    getDocumentById
};
