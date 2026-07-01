const db = require('../config/db.js');

const getAllFranchises = async () => {
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

const getFranchiseById = async (id) => {
    const query = `
        SELECT 
            ipf.*,
            u_mgr.name AS inquiry_manager_name,
            u_add.name AS added_by_name
        FROM in_process_franchises ipf
        LEFT JOIN users u_mgr ON ipf.inquiry_manager_id = u_mgr.id
        LEFT JOIN users u_add ON ipf.added_by = u_add.id
        WHERE ipf.id = ? AND ipf.status = 'completed'
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

const updateFranchise = async (id, data) => {
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
        WHERE id = ? AND status = 'completed'
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

const deleteFranchise = async (id) => {
    const query = `DELETE FROM in_process_franchises WHERE id = ? AND status = 'completed'`;
    const [result] = await db.execute(query, [id]);
    return result;
};

module.exports = {
    getAllFranchises,
    getFranchiseById,
    updateFranchise,
    deleteFranchise
};
