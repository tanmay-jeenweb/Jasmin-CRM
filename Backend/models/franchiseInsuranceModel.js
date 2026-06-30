const db = require('../config/db.js');

const createFranchiseInsuranceTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_insurance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            gst_location VARCHAR(255) NULL,
            start_date DATE NULL,
            end_date DATE NULL,
            amount DECIMAL(12,2) NULL,
            image_path VARCHAR(255) NULL,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("In Process Franchise Insurance table ready");
};

const getFranchiseInsuranceByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            ins.*,
            u.name AS submitted_by_name
        FROM in_process_franchise_insurance ins
        LEFT JOIN users u ON ins.submitted_by = u.id
        WHERE ins.in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows.length > 0 ? rows[0] : null;
};

const upsertFranchiseInsurance = async (franchiseId, data) => {
    const checkQuery = `SELECT id FROM in_process_franchise_insurance WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);

    const gstLocationVal = data.gstLocation || null;
    const startDateVal = data.startDate || null;
    const endDateVal = data.endDate || null;
    const amountVal = data.amount || null;
    const imagePathVal = data.imagePath || null;
    const submittedBy = data.submittedBy;

    if (rows.length > 0) {
        const updateQuery = `
            UPDATE in_process_franchise_insurance SET
                gst_location = ?,
                start_date = ?,
                end_date = ?,
                amount = ?,
                image_path = COALESCE(?, image_path),
                submitted_by = ?
            WHERE in_process_franchise_id = ?
        `;
        await db.execute(updateQuery, [
            gstLocationVal,
            startDateVal,
            endDateVal,
            amountVal,
            imagePathVal,
            submittedBy,
            franchiseId
        ]);
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_insurance (
                in_process_franchise_id, gst_location, start_date, end_date,
                amount, image_path, submitted_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(insertQuery, [
            franchiseId,
            gstLocationVal,
            startDateVal,
            endDateVal,
            amountVal,
            imagePathVal,
            submittedBy
        ]);
    }
};

module.exports = {
    createFranchiseInsuranceTable,
    getFranchiseInsuranceByFranchiseId,
    upsertFranchiseInsurance
};
