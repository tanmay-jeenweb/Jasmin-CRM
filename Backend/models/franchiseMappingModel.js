const db = require('../config/db.js');

const createFranchiseMappingTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_mappings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL,
            mobile_brand_id INT NOT NULL,
            bank_id INT NOT NULL,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (mobile_brand_id) REFERENCES mobile_brand_master(id) ON DELETE CASCADE,
            FOREIGN KEY (bank_id) REFERENCES bank_master(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY (in_process_franchise_id, mobile_brand_id, bank_id)
        )
    `;
    await db.execute(query);
    console.log("In Process Franchise Mappings table ready");
};

const getFranchiseMappingsByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            mobile_brand_id,
            bank_id
        FROM in_process_franchise_mappings
        WHERE in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows;
};

const saveFranchiseMappings = async (franchiseId, mappings, submittedBy) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Delete existing mappings for this franchise
        const deleteQuery = `DELETE FROM in_process_franchise_mappings WHERE in_process_franchise_id = ?`;
        await connection.execute(deleteQuery, [franchiseId]);

        // 2. Insert new mappings
        // mappings is an array of { mobile_brand_id, bank_id }
        if (mappings && mappings.length > 0) {
            const insertQuery = `
                INSERT INTO in_process_franchise_mappings (in_process_franchise_id, mobile_brand_id, bank_id, submitted_by)
                VALUES (?, ?, ?, ?)
            `;
            for (const m of mappings) {
                await connection.execute(insertQuery, [franchiseId, m.mobile_brand_id, m.bank_id, submittedBy]);
            }
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    createFranchiseMappingTable,
    getFranchiseMappingsByFranchiseId,
    saveFranchiseMappings
};
