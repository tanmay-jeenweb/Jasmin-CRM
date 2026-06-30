const db = require('../config/db.js');

const createFranchiseInstallationTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_installation (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL UNIQUE,
            apx TINYINT(1) DEFAULT 0,
            firewall_device TINYINT(1) DEFAULT 0,
            price_list TINYINT(1) DEFAULT 0,
            internet_connection TINYINT(1) DEFAULT 0,
            installation_date DATE NULL,
            remarks TEXT NULL,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("In Process Franchise Installation table ready");
};

const getFranchiseInstallationByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            inst.*,
            u.name AS submitted_by_name
        FROM in_process_franchise_installation inst
        LEFT JOIN users u ON inst.submitted_by = u.id
        WHERE inst.in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows.length > 0 ? rows[0] : null;
};

const upsertFranchiseInstallation = async (franchiseId, data) => {
    const checkQuery = `SELECT id FROM in_process_franchise_installation WHERE in_process_franchise_id = ?`;
    const [rows] = await db.execute(checkQuery, [franchiseId]);

    const apxVal = data.apx ? 1 : 0;
    const firewallDeviceVal = data.firewallDevice ? 1 : 0;
    const priceListVal = data.priceList ? 1 : 0;
    const internetConnectionVal = data.internetConnection ? 1 : 0;
    const installationDateVal = data.installationDate || null;
    const remarksVal = data.remarks || null;
    const submittedBy = data.submittedBy;

    if (rows.length > 0) {
        const updateQuery = `
            UPDATE in_process_franchise_installation SET
                apx = ?,
                firewall_device = ?,
                price_list = ?,
                internet_connection = ?,
                installation_date = ?,
                remarks = ?,
                submitted_by = ?
            WHERE in_process_franchise_id = ?
        `;
        await db.execute(updateQuery, [
            apxVal,
            firewallDeviceVal,
            priceListVal,
            internetConnectionVal,
            installationDateVal,
            remarksVal,
            submittedBy,
            franchiseId
        ]);
    } else {
        const insertQuery = `
            INSERT INTO in_process_franchise_installation (
                in_process_franchise_id, apx, firewall_device, price_list, internet_connection,
                installation_date, remarks, submitted_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(insertQuery, [
            franchiseId,
            apxVal,
            firewallDeviceVal,
            priceListVal,
            internetConnectionVal,
            installationDateVal,
            remarksVal,
            submittedBy
        ]);
    }
};

module.exports = {
    createFranchiseInstallationTable,
    getFranchiseInstallationByFranchiseId,
    upsertFranchiseInstallation
};
