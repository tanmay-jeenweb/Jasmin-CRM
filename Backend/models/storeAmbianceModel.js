const db = require('../config/db.js');

const createStoreAmbianceTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_store_ambiance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            furniture_fixing_file VARCHAR(255) NULL,
            company_furniture_fitting_file VARCHAR(255) NULL,
            shine_board_file VARCHAR(255) NULL,
            in_shop_branding_file VARCHAR(255) NULL,
            temple_location_file VARCHAR(255) NULL,
            ambiance_photo_file VARCHAR(255) NULL,
            remark TEXT NULL,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("In Process Franchise Store Ambiance table ready");
};

const getStoreAmbianceByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            sa.*,
            u.name AS submitted_by_name
        FROM in_process_franchise_store_ambiance sa
        LEFT JOIN users u ON sa.submitted_by = u.id
        WHERE sa.in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows.length > 0 ? rows[0] : null;
};

const upsertStoreAmbiance = async (franchiseId, data) => {
    const checkQuery = `SELECT id FROM in_process_franchise_store_ambiance WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);

    const furnitureFixingVal = data.furnitureFixingFile || null;
    const companyFurnitureFittingVal = data.companyFurnitureFittingFile || null;
    const shineBoardVal = data.shineBoardFile || null;
    const inShopBrandingVal = data.inShopBrandingFile || null;
    const templeLocationVal = data.templeLocationFile || null;
    const ambiancePhotoVal = data.ambiancePhotoFile || null;
    const remarkVal = data.remark || null;
    const submittedBy = data.submittedBy;

    if (rows.length > 0) {
        const updateQuery = `
            UPDATE in_process_franchise_store_ambiance SET
                furniture_fixing_file = COALESCE(?, furniture_fixing_file),
                company_furniture_fitting_file = COALESCE(?, company_furniture_fitting_file),
                shine_board_file = COALESCE(?, shine_board_file),
                in_shop_branding_file = COALESCE(?, in_shop_branding_file),
                temple_location_file = COALESCE(?, temple_location_file),
                ambiance_photo_file = COALESCE(?, ambiance_photo_file),
                remark = ?,
                submitted_by = ?
            WHERE in_process_franchise_id = ?
        `;
        await db.execute(updateQuery, [
            furnitureFixingVal,
            companyFurnitureFittingVal,
            shineBoardVal,
            inShopBrandingVal,
            templeLocationVal,
            ambiancePhotoVal,
            remarkVal,
            submittedBy,
            franchiseId
        ]);
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_store_ambiance (
                in_process_franchise_id, furniture_fixing_file, company_furniture_fitting_file,
                shine_board_file, in_shop_branding_file, temple_location_file, ambiance_photo_file,
                remark, submitted_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(insertQuery, [
            franchiseId,
            furnitureFixingVal,
            companyFurnitureFittingVal,
            shineBoardVal,
            inShopBrandingVal,
            templeLocationVal,
            ambiancePhotoVal,
            remarkVal,
            submittedBy
        ]);
    }
};

module.exports = {
    createStoreAmbianceTable,
    getStoreAmbianceByFranchiseId,
    upsertStoreAmbiance
};
