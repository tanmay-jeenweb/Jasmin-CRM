const db = require('../config/db.js');

const createFindStoreTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_find_stores (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            store_location VARCHAR(255) NOT NULL,
            store_map_link VARCHAR(512) NOT NULL,
            store_photo VARCHAR(255) NOT NULL,
            business_area VARCHAR(255) NOT NULL,
            cluster_value VARCHAR(255) NULL,
            process_active_value VARCHAR(255) NULL,
            authority_certificate VARCHAR(255) NULL,
            status VARCHAR(50) DEFAULT 'pending',
            rejection_reason TEXT NULL,
            submitted_by INT NOT NULL,
            approved_by INT NULL,
            approved_at TIMESTAMP NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `;
    await db.execute(query);
    console.log("In Process Franchise Find Store table ready");
};

const upsertFindStore = async (data) => {
    const checkQuery = `SELECT store_photo, authority_certificate FROM in_process_franchise_find_stores WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [data.inProcessFranchiseId]);

    if (rows.length > 0) {
        // Use existing files if no new ones are provided
        const finalStorePhoto = data.storePhoto !== undefined && data.storePhoto !== null ? data.storePhoto : rows[0].store_photo;
        const finalAuthCert = data.authorityCertificate !== undefined && data.authorityCertificate !== null ? data.authorityCertificate : rows[0].authority_certificate;

        const updateQuery = `
            UPDATE in_process_franchise_find_stores SET
                store_location = ?,
                store_map_link = ?,
                store_photo = ?,
                business_area = ?,
                cluster_value = ?,
                process_active_value = ?,
                authority_certificate = ?,
                status = 'pending',
                rejection_reason = NULL,
                submitted_by = ?
            WHERE in_process_franchise_id = ?
        `;
        const [result] = await db.execute(updateQuery, [
            data.storeLocation,
            data.storeMapLink,
            finalStorePhoto,
            data.businessArea,
            data.clusterValue || null,
            data.processActiveValue || null,
            finalAuthCert || null,
            data.submittedBy,
            data.inProcessFranchiseId
        ]);
        return { action: 'updated', result };
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_find_stores (
                in_process_franchise_id, store_location, store_map_link, store_photo,
                business_area, cluster_value, process_active_value, authority_certificate,
                status, submitted_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
        `;
        const [result] = await db.execute(insertQuery, [
            data.inProcessFranchiseId,
            data.storeLocation,
            data.storeMapLink,
            data.storePhoto,
            data.businessArea,
            data.clusterValue || null,
            data.processActiveValue || null,
            data.authorityCertificate || null,
            data.submittedBy
        ]);
        return { action: 'created', result };
    }
};

const getFindStoreByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            fs.*,
            u_sub.name AS submitted_by_name,
            u_app.name AS approved_by_name
        FROM in_process_franchise_find_stores fs
        LEFT JOIN users u_sub ON fs.submitted_by = u_sub.id
        LEFT JOIN users u_app ON fs.approved_by = u_app.id
        WHERE fs.in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows[0] || null;
};

const approveFindStore = async (franchiseId, approvedBy) => {
    const query = `
        UPDATE in_process_franchise_find_stores SET
            status = 'approved',
            approved_by = ?,
            approved_at = NOW(),
            rejection_reason = NULL
        WHERE in_process_franchise_id = ?
    `;
    const [result] = await db.execute(query, [approvedBy, franchiseId]);
    return result;
};

const rejectFindStore = async (franchiseId, rejectedReason, rejectedBy) => {
    const query = `
        UPDATE in_process_franchise_find_stores SET
            status = 'rejected',
            approved_by = NULL,
            approved_at = NULL,
            rejection_reason = ?
        WHERE in_process_franchise_id = ?
    `;
    const [result] = await db.execute(query, [rejectedReason, franchiseId]);
    return result;
};

const getAllFindStores = async () => {
    const query = `
        SELECT 
            fs.*,
            ipf.partner_name,
            ipf.store_name,
            u_sub.name AS submitted_by_name,
            u_app.name AS approved_by_name
        FROM in_process_franchise_find_stores fs
        JOIN in_process_franchises ipf ON fs.in_process_franchise_id = ipf.id
        LEFT JOIN users u_sub ON fs.submitted_by = u_sub.id
        LEFT JOIN users u_app ON fs.approved_by = u_app.id
        ORDER BY fs.timestamp DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
};

module.exports = {
    createFindStoreTable,
    upsertFindStore,
    getFindStoreByFranchiseId,
    approveFindStore,
    rejectFindStore,
    getAllFindStores
};

