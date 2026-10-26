const db = require('../config/db.js');

const createAgreementGstTables = async () => {
    // 1. Agreement & GST dates and fields table
    const query1 = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_agreement_gst (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            partner_date DATE NULL,
            gst_registration_date DATE NULL,
            gst_number VARCHAR(100) NULL,
            additional_business_address TEXT NULL,
            serial_number_gst_form VARCHAR(255) NULL,
            is_frozen TINYINT(1) DEFAULT 0,
            frozen_at TIMESTAMP NULL,
            frozen_by INT NULL,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query1);

    // Alter table to add new columns if they do not exist
    try {
        await db.execute(`ALTER TABLE in_process_franchise_agreement_gst ADD COLUMN additional_business_address TEXT NULL`);
    } catch (e) {}
    try {
        await db.execute(`ALTER TABLE in_process_franchise_agreement_gst ADD COLUMN serial_number_gst_form VARCHAR(255) NULL`);
    } catch (e) {}
    try {
        await db.execute(`ALTER TABLE in_process_franchise_agreement_gst ADD COLUMN is_frozen TINYINT(1) DEFAULT 0`);
    } catch (e) {}
    try {
        await db.execute(`ALTER TABLE in_process_franchise_agreement_gst ADD COLUMN frozen_at TIMESTAMP NULL`);
    } catch (e) {}
    try {
        await db.execute(`ALTER TABLE in_process_franchise_agreement_gst ADD COLUMN frozen_by INT NULL`);
    } catch (e) {}
    console.log("In Process Franchise Agreement & GST table ready");

    // 2. Agreement & GST documents table
    const query2 = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_documents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL,
            doc_type VARCHAR(255) NOT NULL,
            document_path VARCHAR(255) NULL,
            expiry_date DATE NULL,
            submitted_by INT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query2);

    // Alter table to ensure document_path is nullable and submitted_by exists
    try {
        await db.execute(`ALTER TABLE in_process_franchise_documents MODIFY COLUMN document_path VARCHAR(255) NULL`);
    } catch (e) {}
    try {
        await db.execute(`ALTER TABLE in_process_franchise_documents ADD COLUMN submitted_by INT NULL`);
    } catch (e) {}
    console.log("In Process Franchise Documents table ready");

    // 3. Document expiry notifications read tracking table
    const query3 = `
        CREATE TABLE IF NOT EXISTS document_expiry_notifications_read (
            id INT AUTO_INCREMENT PRIMARY KEY,
            document_id INT NOT NULL,
            user_id INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_doc (user_id, document_id),
            FOREIGN KEY (document_id) REFERENCES in_process_franchise_documents(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query3);

    // 4. In Process Franchise Document Checklist table (per-franchise required documents from master)
    const query4 = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_doc_checklist (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL,
            doc_type VARCHAR(255) NOT NULL,
            is_required TINYINT(1) NOT NULL DEFAULT 1,
            submitted_by INT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_franchise_doc_checklist (in_process_franchise_id, doc_type),
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `;
    await db.execute(query4);
    console.log("In Process Franchise Document Checklist table ready");
};

const getAgreementGstByFranchiseId = async (franchiseId) => {
    const mainQuery = `
        SELECT 
            ag.*,
            u.name AS submitted_by_name,
            u_f.name AS frozen_by_name
        FROM in_process_franchise_agreement_gst ag
        LEFT JOIN users u ON ag.submitted_by = u.id
        LEFT JOIN users u_f ON ag.frozen_by = u_f.id
        WHERE ag.in_process_franchise_id = ?
    `;
    const [mainRows] = await db.execute(mainQuery, [franchiseId]);
    
    const docQuery = `
        SELECT id, doc_type, document_path, expiry_date, submitted_by, timestamp, updated_at
        FROM in_process_franchise_documents 
        WHERE in_process_franchise_id = ?
        ORDER BY id ASC
    `;
    const [docRows] = await db.execute(docQuery, [franchiseId]);
    
    if (mainRows.length === 0) {
        return {
            in_process_franchise_id: Number(franchiseId),
            is_frozen: 0,
            documents: docRows
        };
    }
    
    return {
        ...mainRows[0],
        documents: docRows
    };
};

const getDocChecklistByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            dm.id AS master_id,
            dm.doc_type,
            dm.is_required AS master_is_required,
            COALESCE(cl.is_required, dm.is_required) AS is_required,
            CASE WHEN cl.id IS NOT NULL THEN 1 ELSE 0 END AS is_customized,
            doc.id AS document_id,
            doc.document_path,
            doc.expiry_date,
            CASE WHEN doc.document_path IS NOT NULL AND doc.document_path != '' THEN 1 ELSE 0 END AS is_uploaded,
            doc.updated_at AS document_uploaded_at
        FROM document_master dm
        LEFT JOIN in_process_franchise_doc_checklist cl 
            ON cl.in_process_franchise_id = ? AND LOWER(cl.doc_type) = LOWER(dm.doc_type)
        LEFT JOIN in_process_franchise_documents doc
            ON doc.in_process_franchise_id = ? AND LOWER(doc.doc_type) = LOWER(dm.doc_type)
        ORDER BY dm.id ASC
    `;
    const [rows] = await db.execute(query, [franchiseId, franchiseId]);
    return rows;
};

const saveDocChecklist = async (franchiseId, checklistItems, submittedBy) => {
    if (!checklistItems || !Array.isArray(checklistItems)) return;

    for (const item of checklistItems) {
        if (!item.doc_type) continue;
        const isRequiredVal = item.is_required === true || item.is_required === 1 || item.is_required === '1' ? 1 : 0;
        
        const upsertQuery = `
            INSERT INTO in_process_franchise_doc_checklist (
                in_process_franchise_id, doc_type, is_required, submitted_by
            ) VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                is_required = VALUES(is_required),
                submitted_by = VALUES(submitted_by),
                updated_at = CURRENT_TIMESTAMP
        `;
        await db.execute(upsertQuery, [franchiseId, item.doc_type.trim(), isRequiredVal, submittedBy]);
    }
};

const saveSingleDocument = async (franchiseId, docType, documentPath, expiryDate, submittedBy) => {
    const checkQuery = `
        SELECT id, document_path FROM in_process_franchise_documents 
        WHERE in_process_franchise_id = ? AND LOWER(doc_type) = LOWER(?)
    `;
    const [existing] = await db.execute(checkQuery, [franchiseId, docType.trim()]);

    const expDateVal = expiryDate || null;

    if (existing.length > 0) {
        const docId = existing[0].id;
        const finalPath = documentPath || existing[0].document_path || null;
        const updateQuery = `
            UPDATE in_process_franchise_documents SET
                document_path = ?,
                expiry_date = ?,
                submitted_by = ?
            WHERE id = ?
        `;
        await db.execute(updateQuery, [finalPath, expDateVal, submittedBy, docId]);
        return { id: docId, doc_type: docType, document_path: finalPath, expiry_date: expDateVal };
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_documents (
                in_process_franchise_id, doc_type, document_path, expiry_date, submitted_by
            ) VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(insertQuery, [franchiseId, docType.trim(), documentPath || null, expDateVal, submittedBy]);
        return { id: result.insertId, doc_type: docType, document_path: documentPath || null, expiry_date: expDateVal };
    }
};

const freezeAgreementGst = async (franchiseId, userId) => {
    const checkQuery = `SELECT id FROM in_process_franchise_agreement_gst WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);

    if (rows.length > 0) {
        const updateQuery = `
            UPDATE in_process_franchise_agreement_gst SET
                is_frozen = 1,
                frozen_at = CURRENT_TIMESTAMP,
                frozen_by = ?
            WHERE in_process_franchise_id = ?
        `;
        await db.execute(updateQuery, [userId, franchiseId]);
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_agreement_gst (
                in_process_franchise_id, is_frozen, frozen_at, frozen_by, submitted_by
            ) VALUES (?, 1, CURRENT_TIMESTAMP, ?, ?)
        `;
        await db.execute(insertQuery, [franchiseId, userId, userId]);
    }
};

const upsertAgreementGst = async (franchiseId, partnerDate, gstRegistrationDate, gstNumber, additionalBusinessAddress, serialNumberGstForm, submittedBy, documents) => {
    // 1. Upsert into in_process_franchise_agreement_gst
    const checkQuery = `SELECT id, is_frozen FROM in_process_franchise_agreement_gst WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);

    const partnerDateVal = partnerDate || null;
    const gstRegDateVal = gstRegistrationDate || null;
    const gstNumVal = gstNumber || null;
    const additionalAddressVal = additionalBusinessAddress || null;
    const serialNumberVal = serialNumberGstForm || null;

    if (rows.length > 0) {
        if (rows[0].is_frozen) {
            throw new Error("Agreement & GST is frozen and cannot be modified.");
        }
        const updateQuery = `
            UPDATE in_process_franchise_agreement_gst SET
                partner_date = ?,
                gst_registration_date = ?,
                gst_number = ?,
                additional_business_address = ?,
                serial_number_gst_form = ?,
                submitted_by = ?
            WHERE in_process_franchise_id = ?
        `;
        await db.execute(updateQuery, [partnerDateVal, gstRegDateVal, gstNumVal, additionalAddressVal, serialNumberVal, submittedBy, franchiseId]);
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_agreement_gst (
                in_process_franchise_id, partner_date, gst_registration_date, gst_number, additional_business_address, serial_number_gst_form, submitted_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(insertQuery, [franchiseId, partnerDateVal, gstRegDateVal, gstNumVal, additionalAddressVal, serialNumberVal, submittedBy]);
    }

    // 2. Save documents list if provided (upsert individually to avoid deleting existing files)
    if (documents && Array.isArray(documents)) {
        for (const doc of documents) {
            if (!doc.doc_type) continue;
            await saveSingleDocument(franchiseId, doc.doc_type, doc.document_path, doc.expiry_date, submittedBy);
        }
    }
};

module.exports = {
    createAgreementGstTables,
    getAgreementGstByFranchiseId,
    getDocChecklistByFranchiseId,
    saveDocChecklist,
    saveSingleDocument,
    freezeAgreementGst,
    upsertAgreementGst
};
