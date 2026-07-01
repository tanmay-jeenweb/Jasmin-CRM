const db = require('../config/db.js');

const createInProcessFranchiseTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchises (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inquiry_id INT NULL,
            partner_name VARCHAR(255) NOT NULL,
            partner_mobile VARCHAR(255) NOT NULL,
            partner_email VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            district VARCHAR(255) NOT NULL,
            state VARCHAR(255) NOT NULL,
            franchise_category VARCHAR(255) NULL,
            tentative_opening_date DATE NULL,
            final_opening_date DATE NULL,
            bdm_area VARCHAR(255) NOT NULL,
            inquiry_manager_id INT NOT NULL,
            store_name VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'in_process',
            added_by INT NOT NULL,
            device_id VARCHAR(255) NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL,
            FOREIGN KEY (inquiry_manager_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("In Process Franchise table ready");

    // Migration to add status column if it doesn't exist
    try {
        await db.execute(`ALTER TABLE in_process_franchises ADD COLUMN status VARCHAR(50) DEFAULT 'in_process'`);
    } catch (e) {}

    // Migration to make tentative_opening_date nullable
    try {
        await db.execute(`ALTER TABLE in_process_franchises MODIFY COLUMN tentative_opening_date DATE NULL`);
    } catch (e) {}
};

const createInProcessFranchise = async (data, addedBy, deviceId) => {
    const query = `
        INSERT INTO in_process_franchises (
            inquiry_id, partner_name, partner_mobile, partner_email,
            city, district, state, franchise_category,
            tentative_opening_date, final_opening_date, bdm_area,
            inquiry_manager_id, store_name, added_by, device_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_process')
    `;
    const [result] = await db.execute(query, [
        data.inquiryId || null,
        data.partnerName,
        data.partnerMobile,
        data.partnerEmail,
        data.city,
        data.district,
        data.state,
        data.franchiseCategory || null,
        data.tentativeOpeningDate || null,
        data.finalOpeningDate || null,
        data.bdmArea,
        data.inquiryManagerId,
        data.storeName,
        addedBy,
        deviceId
    ]);

    // If converted from an inquiry, update the inquiry status to 'in process'
    if (data.inquiryId) {
        const updateStatusQuery = `UPDATE inquiries SET status = 'in process' WHERE id = ?`;
        await db.execute(updateStatusQuery, [data.inquiryId]);
    }

    return result;
};

const getAllInProcessFranchises = async () => {
    const query = `
        SELECT 
            ipf.*,
            u_mgr.name AS inquiry_manager_name,
            u_add.name AS added_by_name
        FROM in_process_franchises ipf
        LEFT JOIN users u_mgr ON ipf.inquiry_manager_id = u_mgr.id
        LEFT JOIN users u_add ON ipf.added_by = u_add.id
        WHERE ipf.status = 'in_process'
        ORDER BY ipf.timestamp DESC
    `;
    const [results] = await db.execute(query);
    return results;
};

const getAllCompletedFranchises = async () => {
    const query = `
        SELECT 
            ipf.*,
            u_mgr.name AS inquiry_manager_name,
            u_add.name AS added_by_name
        FROM in_process_franchises ipf
        LEFT JOIN users u_mgr ON ipf.inquiry_manager_id = u_mgr.id
        LEFT JOIN users u_add ON ipf.added_by = u_add.id
        WHERE ipf.status = 'completed'
        ORDER BY ipf.timestamp DESC
    `;
    const [results] = await db.execute(query);
    return results;
};

const updateInProcessFranchise = async (id, data) => {
    const query = `
        UPDATE in_process_franchises SET
            partner_name = ?,
            partner_mobile = ?,
            partner_email = ?,
            city = ?,
            district = ?,
            state = ?,
            franchise_category = ?,
            tentative_opening_date = ?,
            final_opening_date = ?,
            bdm_area = ?,
            inquiry_manager_id = ?,
            store_name = ?
        WHERE id = ?
    `;
    const [result] = await db.execute(query, [
        data.partnerName,
        data.partnerMobile,
        data.partnerEmail,
        data.city,
        data.district,
        data.state,
        data.franchiseCategory || null,
        data.tentativeOpeningDate || null,
        data.finalOpeningDate || null,
        data.bdmArea,
        data.inquiryManagerId,
        data.storeName,
        id
    ]);
    return result;
};

const deleteInProcessFranchise = async (id) => {
    const query = `DELETE FROM in_process_franchises WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
};

const getInProcessFranchiseById = async (id) => {
    const query = `
        SELECT 
            ipf.*,
            u_mgr.name AS inquiry_manager_name,
            u_add.name AS added_by_name
        FROM in_process_franchises ipf
        LEFT JOIN users u_mgr ON ipf.inquiry_manager_id = u_mgr.id
        LEFT JOIN users u_add ON ipf.added_by = u_add.id
        WHERE ipf.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

const convertToFranchise = async (id, tentativeOpeningDate, finalOpeningDate) => {
    const query = `
        UPDATE in_process_franchises SET 
            status = 'completed',
            tentative_opening_date = ?,
            final_opening_date = ?
        WHERE id = ?
    `;
    const [result] = await db.execute(query, [
        tentativeOpeningDate || null,
        finalOpeningDate || null,
        id
    ]);
    return result;
};

module.exports = {
    createInProcessFranchiseTable,
    createInProcessFranchise,
    getAllInProcessFranchises,
    getAllCompletedFranchises,
    updateInProcessFranchise,
    deleteInProcessFranchise,
    getInProcessFranchiseById,
    convertToFranchise
};
