const db = require('../config/db.js');

const createFinanceMachineTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS finance_machine_master (
            id INT AUTO_INCREMENT PRIMARY KEY,
            machine_name VARCHAR(255) NOT NULL UNIQUE,
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            for_code ENUM('Yes', 'No') DEFAULT 'No',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("Finance Machine master table ready");
};

const createFinanceMachine = async (machineName, addedBy, deviceId, forCode) => {
    const query = `INSERT INTO finance_machine_master (machine_name, added_by, device_id, for_code) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(query, [machineName, addedBy, deviceId, forCode || 'No']);
    return result;
};

const getAllFinanceMachines = async () => {
    const query = `
        SELECT
            fmm.id,
            fmm.machine_name,
            fmm.for_code,
            COALESCE(u.name, 'Unknown') AS added_by_name,
            fmm.device_id,
            fmm.timestamp
        FROM finance_machine_master fmm
        LEFT JOIN users u ON fmm.added_by = u.id
        ORDER BY fmm.timestamp DESC
    `;
    const [results] = await db.execute(query);
    return results;
};

const updateFinanceMachine = async (id, machineName, forCode) => {
    const query = `UPDATE finance_machine_master SET machine_name = ?, for_code = ? WHERE id = ?`;
    const [result] = await db.execute(query, [machineName, forCode || 'No', id]);
    return result;
};

const deleteFinanceMachine = async (id) => {
    const query = `DELETE FROM finance_machine_master WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
};

const getFinanceMachineById = async (id) => {
    const query = `
        SELECT id, machine_name, for_code, added_by, device_id, timestamp 
        FROM finance_machine_master 
        WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

module.exports = {
    createFinanceMachineTable,
    createFinanceMachine,
    getAllFinanceMachines,
    updateFinanceMachine,
    deleteFinanceMachine,
    getFinanceMachineById
};
