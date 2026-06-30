const db = require('../config/db.js');

const createStorePlanningTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_store_planning (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            main_board_sign_size VARCHAR(255) NULL,
            interior_file VARCHAR(255) NULL,
            inshop_branding_file VARCHAR(255) NULL,
            floor_plan_file VARCHAR(255) NULL,
            billing_format_file VARCHAR(255) NULL,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("In Process Franchise Store Planning table ready");
};

const getStorePlanningByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            sp.*,
            u.name AS submitted_by_name
        FROM in_process_franchise_store_planning sp
        LEFT JOIN users u ON sp.submitted_by = u.id
        WHERE sp.in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows.length > 0 ? rows[0] : null;
};

const upsertStorePlanning = async (franchiseId, data) => {
    const checkQuery = `SELECT id FROM in_process_franchise_store_planning WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);

    const signSizeVal = data.mainBoardSignSize || null;
    const interiorVal = data.interiorFile || null;
    const inshopBrandingVal = data.inshopBrandingFile || null;
    const floorPlanVal = data.floorPlanFile || null;
    const billingFormatVal = data.billingFormatFile || null;
    const submittedBy = data.submittedBy;

    if (rows.length > 0) {
        const updateQuery = `
            UPDATE in_process_franchise_store_planning SET
                main_board_sign_size = ?,
                interior_file = COALESCE(?, interior_file),
                inshop_branding_file = COALESCE(?, inshop_branding_file),
                floor_plan_file = COALESCE(?, floor_plan_file),
                billing_format_file = COALESCE(?, billing_format_file),
                submitted_by = ?
            WHERE in_process_franchise_id = ?
        `;
        await db.execute(updateQuery, [
            signSizeVal,
            interiorVal,
            inshopBrandingVal,
            floorPlanVal,
            billingFormatVal,
            submittedBy,
            franchiseId
        ]);
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_store_planning (
                in_process_franchise_id, main_board_sign_size, interior_file,
                inshop_branding_file, floor_plan_file, billing_format_file, submitted_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(insertQuery, [
            franchiseId,
            signSizeVal,
            interiorVal,
            inshopBrandingVal,
            floorPlanVal,
            billingFormatVal,
            submittedBy
        ]);
    }
};

module.exports = {
    createStorePlanningTable,
    getStorePlanningByFranchiseId,
    upsertStorePlanning
};
