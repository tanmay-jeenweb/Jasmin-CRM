const db = require('../config/db.js');

const createFranchiseDepositStockTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_deposit_stock (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            po_creation_date DATE NULL,
            po_number VARCHAR(100) NULL,
            expected_opening_date DATE NULL,
            chk_stock TINYINT(1) DEFAULT 0,
            chk_bill_paper TINYINT(1) DEFAULT 0,
            chk_bag TINYINT(1) DEFAULT 0,
            chk_blue_chit TINYINT(1) DEFAULT 0,
            chk_stamp TINYINT(1) DEFAULT 0,
            chk_swipe_machine TINYINT(1) DEFAULT 0,
            chk_qr_code TINYINT(1) DEFAULT 0,
            stock_received_apx TINYINT(1) DEFAULT 0,
            stock_received_apx_date DATE NULL,
            status VARCHAR(50) DEFAULT 'draft',
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
    console.log("In Process Franchise Deposit Stock table ready");

    // Alter table to add approval columns if they do not exist
    try {
        await db.execute(`ALTER TABLE in_process_franchise_deposit_stock ADD COLUMN status VARCHAR(50) DEFAULT 'draft'`);
    } catch (e) {}
    try {
        await db.execute(`ALTER TABLE in_process_franchise_deposit_stock ADD COLUMN rejection_reason TEXT NULL`);
    } catch (e) {}
    try {
        await db.execute(`ALTER TABLE in_process_franchise_deposit_stock ADD COLUMN approved_by INT NULL`);
    } catch (e) {}
    try {
        await db.execute(`ALTER TABLE in_process_franchise_deposit_stock ADD COLUMN approved_at TIMESTAMP NULL`);
    } catch (e) {}
};

const getFranchiseDepositStockByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            ds.*,
            u.name AS submitted_by_name,
            u_app.name AS approved_by_name
        FROM in_process_franchise_deposit_stock ds
        LEFT JOIN users u ON ds.submitted_by = u.id
        LEFT JOIN users u_app ON ds.approved_by = u_app.id
        WHERE ds.in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows.length > 0 ? rows[0] : null;
};

const upsertFranchiseDepositStock = async (franchiseId, data) => {
    const checkQuery = `SELECT id, status FROM in_process_franchise_deposit_stock WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);

    const poCreationDateVal = data.poCreationDate || null;
    const poNumberVal = data.poNumber || null;
    const expectedOpeningDateVal = data.expectedOpeningDate || null;
    
    const chkStockVal = data.chkStock ? 1 : 0;
    const chkBillPaperVal = data.chkBillPaper ? 1 : 0;
    const chkBagVal = data.chkBag ? 1 : 0;
    const chkBlueChitVal = data.chkBlueChit ? 1 : 0;
    const chkStampVal = data.chkStamp ? 1 : 0;
    const chkSwipeMachineVal = data.chkSwipeMachine ? 1 : 0;
    const chkQrCodeVal = data.chkQrCode ? 1 : 0;
    
    const stockReceivedApxVal = data.stockReceivedApx ? 1 : 0;
    const stockReceivedApxDateVal = data.stockReceivedApxDate || null;
    const statusVal = data.status || (rows.length > 0 ? rows[0].status : 'draft');
    const submittedBy = data.submittedBy;

    if (rows.length > 0) {
        const updateQuery = `
            UPDATE in_process_franchise_deposit_stock SET
                po_creation_date = ?,
                po_number = ?,
                expected_opening_date = ?,
                chk_stock = ?,
                chk_bill_paper = ?,
                chk_bag = ?,
                chk_blue_chit = ?,
                chk_stamp = ?,
                chk_swipe_machine = ?,
                chk_qr_code = ?,
                stock_received_apx = ?,
                stock_received_apx_date = ?,
                status = ?,
                rejection_reason = NULL,
                submitted_by = ?
            WHERE in_process_franchise_id = ?
        `;
        await db.execute(updateQuery, [
            poCreationDateVal,
            poNumberVal,
            expectedOpeningDateVal,
            chkStockVal,
            chkBillPaperVal,
            chkBagVal,
            chkBlueChitVal,
            chkStampVal,
            chkSwipeMachineVal,
            chkQrCodeVal,
            stockReceivedApxVal,
            stockReceivedApxDateVal,
            statusVal,
            submittedBy,
            franchiseId
        ]);
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_deposit_stock (
                in_process_franchise_id, po_creation_date, po_number, expected_opening_date,
                chk_stock, chk_bill_paper, chk_bag, chk_blue_chit, chk_stamp, chk_swipe_machine, chk_qr_code,
                stock_received_apx, stock_received_apx_date, status, submitted_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(insertQuery, [
            franchiseId,
            poCreationDateVal,
            poNumberVal,
            expectedOpeningDateVal,
            chkStockVal,
            chkBillPaperVal,
            chkBagVal,
            chkBlueChitVal,
            chkStampVal,
            chkSwipeMachineVal,
            chkQrCodeVal,
            stockReceivedApxVal,
            stockReceivedApxDateVal,
            statusVal,
            submittedBy
        ]);
    }
};

const approveFranchiseDepositStock = async (franchiseId, approvedBy) => {
    const query = `
        UPDATE in_process_franchise_deposit_stock SET
            status = 'approved',
            approved_by = ?,
            approved_at = NOW(),
            rejection_reason = NULL
        WHERE in_process_franchise_id = ?
    `;
    await db.execute(query, [approvedBy, franchiseId]);
};

const rejectFranchiseDepositStock = async (franchiseId, rejectedReason, rejectedBy) => {
    const query = `
        UPDATE in_process_franchise_deposit_stock SET
            status = 'rejected',
            approved_by = NULL,
            approved_at = NULL,
            rejection_reason = ?
        WHERE in_process_franchise_id = ?
    `;
    await db.execute(query, [rejectedReason, franchiseId]);
};

const getAllDepositStocks = async () => {
    const query = `
        SELECT 
            ds.*,
            ipf.partner_name,
            ipf.store_name,
            u_sub.name AS submitted_by_name,
            u_app.name AS approved_by_name
        FROM in_process_franchise_deposit_stock ds
        JOIN in_process_franchises ipf ON ds.in_process_franchise_id = ipf.id
        LEFT JOIN users u_sub ON ds.submitted_by = u_sub.id
        LEFT JOIN users u_app ON ds.approved_by = u_app.id
        ORDER BY ds.timestamp DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
};

module.exports = {
    createFranchiseDepositStockTable,
    getFranchiseDepositStockByFranchiseId,
    upsertFranchiseDepositStock,
    approveFranchiseDepositStock,
    rejectFranchiseDepositStock,
    getAllDepositStocks
};
