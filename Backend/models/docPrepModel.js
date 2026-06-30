const db = require('../config/db.js');

const createDocPrepTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_doc_prep (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            dispatch_date DATE NULL,
            dispatch_name VARCHAR(255) NULL,
            dispatch_file VARCHAR(255) NULL,
            receiver_date DATE NULL,
            receiver_name VARCHAR(255) NULL,
            receiver_file VARCHAR(255) NULL,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("In Process Franchise Document Preparation table ready");
};

const getDocPrepByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            dp.*,
            u.name AS submitted_by_name
        FROM in_process_franchise_doc_prep dp
        LEFT JOIN users u ON dp.submitted_by = u.id
        WHERE dp.in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows.length > 0 ? rows[0] : null;
};

const upsertDocPrep = async (franchiseId, data) => {
    const checkQuery = `SELECT id FROM in_process_franchise_doc_prep WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);

    const dispatchDateVal = data.dispatchDate || null;
    const dispatchNameVal = data.dispatchName || null;
    const dispatchFileVal = data.dispatchFile || null;
    const receiverDateVal = data.receiverDate || null;
    const receiverNameVal = data.receiverName || null;
    const receiverFileVal = data.receiverFile || null;
    const submittedBy = data.submittedBy;

    if (rows.length > 0) {
        const updateQuery = `
            UPDATE in_process_franchise_doc_prep SET
                dispatch_date = ?,
                dispatch_name = ?,
                dispatch_file = COALESCE(?, dispatch_file),
                receiver_date = ?,
                receiver_name = ?,
                receiver_file = COALESCE(?, receiver_file),
                submitted_by = ?
            WHERE in_process_franchise_id = ?
        `;
        await db.execute(updateQuery, [
            dispatchDateVal,
            dispatchNameVal,
            dispatchFileVal,
            receiverDateVal,
            receiverNameVal,
            receiverFileVal,
            submittedBy,
            franchiseId
        ]);
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_doc_prep (
                in_process_franchise_id, dispatch_date, dispatch_name, dispatch_file,
                receiver_date, receiver_name, receiver_file, submitted_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(insertQuery, [
            franchiseId,
            dispatchDateVal,
            dispatchNameVal,
            dispatchFileVal,
            receiverDateVal,
            receiverNameVal,
            receiverFileVal,
            submittedBy
        ]);
    }
};

module.exports = {
    createDocPrepTable,
    getDocPrepByFranchiseId,
    upsertDocPrep
};
