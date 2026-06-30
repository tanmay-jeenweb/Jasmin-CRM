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
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query1);
    console.log("In Process Franchise Agreement & GST table ready");

    // 2. Agreement & GST documents table
    const query2 = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_documents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL,
            doc_type VARCHAR(255) NOT NULL,
            document_path VARCHAR(255) NOT NULL,
            expiry_date DATE NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query2);
    console.log("In Process Franchise Documents table ready");
};

const getAgreementGstByFranchiseId = async (franchiseId) => {
    const mainQuery = `
        SELECT 
            ag.*,
            u.name AS submitted_by_name
        FROM in_process_franchise_agreement_gst ag
        LEFT JOIN users u ON ag.submitted_by = u.id
        WHERE ag.in_process_franchise_id = ?
    `;
    const [mainRows] = await db.execute(mainQuery, [franchiseId]);
    
    if (mainRows.length === 0) {
        return null;
    }
    
    const docQuery = `
        SELECT id, doc_type, document_path, expiry_date, timestamp
        FROM in_process_franchise_documents 
        WHERE in_process_franchise_id = ?
    `;
    const [docRows] = await db.execute(docQuery, [franchiseId]);
    
    return {
        ...mainRows[0],
        documents: docRows
    };
};

const upsertAgreementGst = async (franchiseId, partnerDate, gstRegistrationDate, gstNumber, submittedBy, documents) => {
    // 1. Upsert into in_process_franchise_agreement_gst
    const checkQuery = `SELECT id FROM in_process_franchise_agreement_gst WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);

    const partnerDateVal = partnerDate || null;
    const gstRegDateVal = gstRegistrationDate || null;
    const gstNumVal = gstNumber || null;

    if (rows.length > 0) {
        const updateQuery = `
            UPDATE in_process_franchise_agreement_gst SET
                partner_date = ?,
                gst_registration_date = ?,
                gst_number = ?,
                submitted_by = ?
            WHERE in_process_franchise_id = ?
        `;
        await db.execute(updateQuery, [partnerDateVal, gstRegDateVal, gstNumVal, submittedBy, franchiseId]);
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_agreement_gst (
                in_process_franchise_id, partner_date, gst_registration_date, gst_number, submitted_by
            ) VALUES (?, ?, ?, ?, ?)
        `;
        await db.execute(insertQuery, [franchiseId, partnerDateVal, gstRegDateVal, gstNumVal, submittedBy]);
    }

    // 2. Save documents list
    // Delete existing documents
    const deleteDocsQuery = `DELETE FROM in_process_franchise_documents WHERE in_process_franchise_id = ?`;
    await db.execute(deleteDocsQuery, [franchiseId]);

    // Insert new list of documents
    if (documents && documents.length > 0) {
        const insertDocQuery = `
            INSERT INTO in_process_franchise_documents (
                in_process_franchise_id, doc_type, document_path, expiry_date
            ) VALUES (?, ?, ?, ?)
        `;
        for (const doc of documents) {
            const expDateVal = doc.expiry_date || null;
            await db.execute(insertDocQuery, [franchiseId, doc.doc_type, doc.document_path, expDateVal]);
        }
    }
};

module.exports = {
    createAgreementGstTables,
    getAgreementGstByFranchiseId,
    upsertAgreementGst
};
