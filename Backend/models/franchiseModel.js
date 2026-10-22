const db = require('../config/db.js');

const getAllFranchises = async (userId = null, userRole = null, isDeleted = false) => {
    let whereClause = "WHERE ipf.status = 'completed'";
    const params = [];

    if (isDeleted) {
        whereClause += " AND ipf.is_deleted = 1";
    } else {
        whereClause += " AND (ipf.is_deleted = 0 OR ipf.is_deleted IS NULL)";
    }

    if (userRole !== 'admin' && userRole !== 'super admin' && userRole !== 'office staff') {
        whereClause += " AND ipf.added_by = ?";
        params.push(userId);
    }
    const query = `
        SELECT 
            ipf.*,
            u_mgr.name AS inquiry_manager_name,
            u_add.name AS added_by_name,
            u_del.name AS deleted_by_name
        FROM in_process_franchises ipf
        LEFT JOIN users u_mgr ON ipf.inquiry_manager_id = u_mgr.id
        LEFT JOIN users u_add ON ipf.added_by = u_add.id
        LEFT JOIN users u_del ON ipf.deleted_by = u_del.id
        ${whereClause}
        ORDER BY ${isDeleted ? 'ipf.deleted_at DESC' : 'ipf.timestamp DESC'}
    `;
    const [results] = await db.execute(query, params);
    return results;
};

const getFranchiseById = async (id) => {
    const query = `
        SELECT 
            ipf.*,
            u_mgr.name AS inquiry_manager_name,
            u_add.name AS added_by_name,
            u_del.name AS deleted_by_name
        FROM in_process_franchises ipf
        LEFT JOIN users u_mgr ON ipf.inquiry_manager_id = u_mgr.id
        LEFT JOIN users u_add ON ipf.added_by = u_add.id
        LEFT JOIN users u_del ON ipf.deleted_by = u_del.id
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

const softDeleteFranchise = async (id, deletedBy = null) => {
    const query = `
        UPDATE in_process_franchises 
        SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_by = ? 
        WHERE id = ? AND status = 'completed'
    `;
    const [result] = await db.execute(query, [deletedBy, id]);
    return result;
};

const restoreFranchise = async (id) => {
    const query = `
        UPDATE in_process_franchises 
        SET is_deleted = 0, deleted_at = NULL, deleted_by = NULL 
        WHERE id = ? AND status = 'completed'
    `;
    const [result] = await db.execute(query, [id]);
    return result;
};

const deleteFranchise = async (id, deletedBy = null) => {
    return softDeleteFranchise(id, deletedBy);
};

module.exports = {
    getAllFranchises,
    getFranchiseById,
    updateFranchise,
    softDeleteFranchise,
    restoreFranchise,
    deleteFranchise
};
