const db = require('../config/db.js');

const createInternalAgreementTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_internal_agreement (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            internal_agreement_file VARCHAR(255) NULL,
            is_locked TINYINT(1) DEFAULT 0,
            locked_at TIMESTAMP NULL,
            locked_by INT NULL,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);

    // Auto-migrate any existing tables that lack the new columns
    const alterColumns = [
        "ALTER TABLE in_process_franchise_internal_agreement ADD COLUMN is_locked TINYINT(1) DEFAULT 0",
        "ALTER TABLE in_process_franchise_internal_agreement ADD COLUMN locked_at TIMESTAMP NULL",
        "ALTER TABLE in_process_franchise_internal_agreement ADD COLUMN locked_by INT NULL"
    ];

    for (const alterSql of alterColumns) {
        try {
            await db.execute(alterSql);
        } catch (e) {
            // column already exists
        }
    }

    console.log("In Process Franchise Internal Agreement table ready");
};

const getInternalAgreementByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            ia.*,
            u.name AS submitted_by_name,
            u_l.name AS locked_by_name
        FROM in_process_franchise_internal_agreement ia
        LEFT JOIN users u ON ia.submitted_by = u.id
        LEFT JOIN users u_l ON ia.locked_by = u_l.id
        WHERE ia.in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows.length > 0 ? rows[0] : null;
};

const upsertInternalAgreement = async (franchiseId, data) => {
    const checkQuery = `SELECT id, is_locked FROM in_process_franchise_internal_agreement WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);

    if (rows.length > 0 && rows[0].is_locked) {
        throw new Error("Internal Agreement is locked and cannot be modified.");
    }

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

const lockInternalAgreement = async (franchiseId, userId) => {
    const checkQuery = `SELECT id FROM in_process_franchise_internal_agreement WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);
    if (rows.length > 0) {
        await db.execute(
            `UPDATE in_process_franchise_internal_agreement SET is_locked = 1, locked_at = CURRENT_TIMESTAMP, locked_by = ? WHERE in_process_franchise_id = ?`,
            [userId, franchiseId]
        );
    } else {
        await db.execute(
            `INSERT INTO in_process_franchise_internal_agreement (in_process_franchise_id, is_locked, locked_at, locked_by, submitted_by) VALUES (?, 1, CURRENT_TIMESTAMP, ?, ?)`,
            [franchiseId, userId, userId]
        );
    }
};

const unlockInternalAgreement = async (franchiseId) => {
    await db.execute(
        `UPDATE in_process_franchise_internal_agreement SET is_locked = 0, locked_at = NULL, locked_by = NULL WHERE in_process_franchise_id = ?`,
        [franchiseId]
    );
};

module.exports = {
    createInternalAgreementTable,
    getInternalAgreementByFranchiseId,
    upsertInternalAgreement,
    lockInternalAgreement,
    unlockInternalAgreement
};
