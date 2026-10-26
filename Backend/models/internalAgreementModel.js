const db = require('../config/db.js');

const createInternalAgreementTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_internal_agreement (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            internal_agreement_file VARCHAR(255) NULL,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("In Process Franchise Internal Agreement table ready");
};

const getInternalAgreementByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            ia.*,
            u.name AS submitted_by_name
        FROM in_process_franchise_internal_agreement ia
        LEFT JOIN users u ON ia.submitted_by = u.id
        WHERE ia.in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows.length > 0 ? rows[0] : null;
};

const upsertInternalAgreement = async (franchiseId, data) => {
    const checkQuery = `SELECT id FROM in_process_franchise_internal_agreement WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);

    const fileVal = data.internalAgreementFile || null;
    const submittedBy = data.submittedBy;

    if (rows.length > 0) {
        const updateQuery = `
            UPDATE in_process_franchise_internal_agreement SET
                internal_agreement_file = COALESCE(?, internal_agreement_file),
                submitted_by = ?
            WHERE in_process_franchise_id = ?
        `;
        await db.execute(updateQuery, [
            fileVal,
            submittedBy,
            franchiseId
        ]);
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_internal_agreement (
                in_process_franchise_id, internal_agreement_file, submitted_by
            ) VALUES (?, ?, ?)
        `;
        await db.execute(insertQuery, [
            franchiseId,
            fileVal,
            submittedBy
        ]);
    }
};

module.exports = {
    createInternalAgreementTable,
    getInternalAgreementByFranchiseId,
    upsertInternalAgreement
};
