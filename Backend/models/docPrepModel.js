const db = require('../config/db.js');

const createDocPrepTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_doc_prep (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            ho_agreement_completed ENUM('Yes', 'No') NULL,
            ho_agreement_completion_date DATE NULL,
            ho_agreement_file VARCHAR(255) NULL,
            dispatch_date DATE NULL,
            dispatch_name VARCHAR(255) NULL,
            dispatch_file VARCHAR(255) NULL,
            receiver_date DATE NULL,
            receiver_name VARCHAR(255) NULL,
            receiver_file VARCHAR(255) NULL,
            franchise_agreement_completed ENUM('Yes', 'No') NULL,
            franchise_agreement_completion_date DATE NULL,
            franchise_agreement_file VARCHAR(255) NULL,
            franchise_dispatch_date DATE NULL,
            franchise_dispatch_name VARCHAR(255) NULL,
            franchise_dispatch_file VARCHAR(255) NULL,
            ho_receiver_date DATE NULL,
            ho_receiver_name VARCHAR(255) NULL,
            ho_receiver_file VARCHAR(255) NULL,
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
        "ALTER TABLE in_process_franchise_doc_prep ADD COLUMN ho_agreement_completed ENUM('Yes', 'No') NULL",
        "ALTER TABLE in_process_franchise_doc_prep ADD COLUMN ho_agreement_completion_date DATE NULL",
        "ALTER TABLE in_process_franchise_doc_prep ADD COLUMN ho_agreement_file VARCHAR(255) NULL",
        "ALTER TABLE in_process_franchise_doc_prep ADD COLUMN franchise_agreement_completed ENUM('Yes', 'No') NULL",
        "ALTER TABLE in_process_franchise_doc_prep ADD COLUMN franchise_agreement_completion_date DATE NULL",
        "ALTER TABLE in_process_franchise_doc_prep ADD COLUMN franchise_agreement_file VARCHAR(255) NULL",
        "ALTER TABLE in_process_franchise_doc_prep ADD COLUMN franchise_dispatch_date DATE NULL",
        "ALTER TABLE in_process_franchise_doc_prep ADD COLUMN franchise_dispatch_name VARCHAR(255) NULL",
        "ALTER TABLE in_process_franchise_doc_prep ADD COLUMN franchise_dispatch_file VARCHAR(255) NULL",
        "ALTER TABLE in_process_franchise_doc_prep ADD COLUMN ho_receiver_date DATE NULL",
        "ALTER TABLE in_process_franchise_doc_prep ADD COLUMN ho_receiver_name VARCHAR(255) NULL",
        "ALTER TABLE in_process_franchise_doc_prep ADD COLUMN ho_receiver_file VARCHAR(255) NULL"
    ];

    for (const alterSql of alterColumns) {
        try {
            await db.execute(alterSql);
        } catch (e) {
            // column already exists
        }
    }

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

    const hoAgreementCompleted = data.hoAgreementCompleted || null;
    const hoAgreementCompletionDate = data.hoAgreementCompletionDate || null;
    const hoAgreementFile = data.hoAgreementFile || null;
    const dispatchDateVal = data.dispatchDate || null;
    const dispatchNameVal = data.dispatchName || null;
    const dispatchFileVal = data.dispatchFile || null;
    const receiverDateVal = data.receiverDate || null;
    const receiverNameVal = data.receiverName || null;
    const receiverFileVal = data.receiverFile || null;

    const franchiseAgreementCompleted = data.franchiseAgreementCompleted || null;
    const franchiseAgreementCompletionDate = data.franchiseAgreementCompletionDate || null;
    const franchiseAgreementFile = data.franchiseAgreementFile || null;
    const franchiseDispatchDateVal = data.franchiseDispatchDate || null;
    const franchiseDispatchNameVal = data.franchiseDispatchName || null;
    const franchiseDispatchFileVal = data.franchiseDispatchFile || null;
    const hoReceiverDateVal = data.hoReceiverDate || null;
    const hoReceiverNameVal = data.hoReceiverName || null;
    const hoReceiverFileVal = data.hoReceiverFile || null;

    const submittedBy = data.submittedBy;

    if (rows.length > 0) {
        const updateQuery = `
            UPDATE in_process_franchise_doc_prep SET
                ho_agreement_completed = ?,
                ho_agreement_completion_date = ?,
                ho_agreement_file = COALESCE(?, ho_agreement_file),
                dispatch_date = ?,
                dispatch_name = ?,
                dispatch_file = COALESCE(?, dispatch_file),
                receiver_date = ?,
                receiver_name = ?,
                receiver_file = COALESCE(?, receiver_file),
                franchise_agreement_completed = ?,
                franchise_agreement_completion_date = ?,
                franchise_agreement_file = COALESCE(?, franchise_agreement_file),
                franchise_dispatch_date = ?,
                franchise_dispatch_name = ?,
                franchise_dispatch_file = COALESCE(?, franchise_dispatch_file),
                ho_receiver_date = ?,
                ho_receiver_name = ?,
                ho_receiver_file = COALESCE(?, ho_receiver_file),
                submitted_by = ?
            WHERE in_process_franchise_id = ?
        `;
        await db.execute(updateQuery, [
            hoAgreementCompleted,
            hoAgreementCompletionDate,
            hoAgreementFile,
            dispatchDateVal,
            dispatchNameVal,
            dispatchFileVal,
            receiverDateVal,
            receiverNameVal,
            receiverFileVal,
            franchiseAgreementCompleted,
            franchiseAgreementCompletionDate,
            franchiseAgreementFile,
            franchiseDispatchDateVal,
            franchiseDispatchNameVal,
            franchiseDispatchFileVal,
            hoReceiverDateVal,
            hoReceiverNameVal,
            hoReceiverFileVal,
            submittedBy,
            franchiseId
        ]);
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_doc_prep (
                in_process_franchise_id,
                ho_agreement_completed, ho_agreement_completion_date, ho_agreement_file,
                dispatch_date, dispatch_name, dispatch_file,
                receiver_date, receiver_name, receiver_file,
                franchise_agreement_completed, franchise_agreement_completion_date, franchise_agreement_file,
                franchise_dispatch_date, franchise_dispatch_name, franchise_dispatch_file,
                ho_receiver_date, ho_receiver_name, ho_receiver_file,
                submitted_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(insertQuery, [
            franchiseId,
            hoAgreementCompleted,
            hoAgreementCompletionDate,
            hoAgreementFile,
            dispatchDateVal,
            dispatchNameVal,
            dispatchFileVal,
            receiverDateVal,
            receiverNameVal,
            receiverFileVal,
            franchiseAgreementCompleted,
            franchiseAgreementCompletionDate,
            franchiseAgreementFile,
            franchiseDispatchDateVal,
            franchiseDispatchNameVal,
            franchiseDispatchFileVal,
            hoReceiverDateVal,
            hoReceiverNameVal,
            hoReceiverFileVal,
            submittedBy
        ]);
    }
};

module.exports = {
    createDocPrepTable,
    getDocPrepByFranchiseId,
    upsertDocPrep
};
