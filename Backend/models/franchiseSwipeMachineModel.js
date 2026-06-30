const db = require('../config/db.js');

const createFranchiseSwipeMachineTable = async () => {
    // Main Swipe Machine table
    const mainQuery = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_swipe_machine (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            agreement_photo_receipt_date DATE NULL,
            qr_bharat_pay TINYINT(1) DEFAULT 0,
            qr_hdfc TINYINT(1) DEFAULT 0,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(mainQuery);

    // Brands & Payment platforms matrix table
    const matrixQuery = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_swipe_brands (
            id INT AUTO_INCREMENT PRIMARY KEY,
            swipe_machine_id INT NOT NULL,
            brand_name VARCHAR(50) NOT NULL,
            platform_name VARCHAR(50) NOT NULL,
            FOREIGN KEY (swipe_machine_id) REFERENCES in_process_franchise_swipe_machine(id) ON DELETE CASCADE,
            UNIQUE KEY (swipe_machine_id, brand_name, platform_name)
        )
    `;
    await db.execute(matrixQuery);
    console.log("In Process Franchise Swipe Machine tables ready");
};

const getFranchiseSwipeMachineByFranchiseId = async (franchiseId) => {
    const mainQuery = `
        SELECT 
            sm.*,
            u.name AS submitted_by_name
        FROM in_process_franchise_swipe_machine sm
        LEFT JOIN users u ON sm.submitted_by = u.id
        WHERE sm.in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(mainQuery, [franchiseId]);
    if (rows.length === 0) return null;

    const swipeMachine = rows[0];

    const matrixQuery = `
        SELECT brand_name, platform_name 
        FROM in_process_franchise_swipe_brands 
        WHERE swipe_machine_id = ?
    `;
    const [brands] = await db.execute(matrixQuery, [swipeMachine.id]);
    swipeMachine.brands = brands;

    return swipeMachine;
};

const upsertFranchiseSwipeMachine = async (franchiseId, data) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const receiptDateVal = data.agreementPhotoReceiptDate || null;
        const qrBharatPayVal = data.qrBharatPay ? 1 : 0;
        const qrHdfcVal = data.qrHdfc ? 1 : 0;
        const submittedBy = data.submittedBy;

        // 1. Check if main record exists
        const checkQuery = `SELECT id FROM in_process_franchise_swipe_machine WHERE in_process_franchise_id = ?`;
        const [rows] = await connection.execute(checkQuery, [franchiseId]);

        let swipeMachineId;

        if (rows.length > 0) {
            swipeMachineId = rows[0].id;
            const updateQuery = `
                UPDATE in_process_franchise_swipe_machine SET
                    agreement_photo_receipt_date = ?,
                    qr_bharat_pay = ?,
                    qr_hdfc = ?,
                    submitted_by = ?
                WHERE id = ?
            `;
            await connection.execute(updateQuery, [
                receiptDateVal,
                qrBharatPayVal,
                qrHdfcVal,
                submittedBy,
                swipeMachineId
            ]);
        } else {
            const insertQuery = `
                INSERT INTO in_process_franchise_swipe_machine (
                    in_process_franchise_id, agreement_photo_receipt_date, qr_bharat_pay, qr_hdfc, submitted_by
                ) VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await connection.execute(insertQuery, [
                franchiseId,
                receiptDateVal,
                qrBharatPayVal,
                qrHdfcVal,
                submittedBy
            ]);
            swipeMachineId = result.insertId;
        }

        // 2. Clear existing matrix mappings
        const deleteMatrixQuery = `DELETE FROM in_process_franchise_swipe_brands WHERE swipe_machine_id = ?`;
        await connection.execute(deleteMatrixQuery, [swipeMachineId]);

        // 3. Insert new matrix mappings
        if (data.brands && data.brands.length > 0) {
            const insertMatrixQuery = `
                INSERT INTO in_process_franchise_swipe_brands (swipe_machine_id, brand_name, platform_name)
                VALUES (?, ?, ?)
            `;
            for (const b of data.brands) {
                await connection.execute(insertMatrixQuery, [swipeMachineId, b.brand_name, b.platform_name]);
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
    createFranchiseSwipeMachineTable,
    getFranchiseSwipeMachineByFranchiseId,
    upsertFranchiseSwipeMachine
};
