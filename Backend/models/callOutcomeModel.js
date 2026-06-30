const db = require('../config/db.js');

const createCallOutcomesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS call_outcome_master (
            id INT AUTO_INCREMENT PRIMARY KEY,
            outcome_name VARCHAR(255) NOT NULL UNIQUE,
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    await db.execute(query);
    console.log("Call outcome master table ready");

    // Seed default call outcomes if the table is empty
    try {
        const [rows] = await db.execute("SELECT COUNT(*) AS count FROM call_outcome_master");
        if (rows[0].count === 0) {
            const defaults = ["Busy", "Connected", "Left Live Message", "Left voicemail", "No Answer", "Wrong number"];
            for (const outcome of defaults) {
                await db.execute(
                    "INSERT INTO call_outcome_master (outcome_name, added_by, device_id) VALUES (?, ?, ?)",
                    [outcome, 1, "System Seed"]
                );
            }
            console.log("✅ Seeded default call outcomes.");
        }
    } catch (err) {
        console.error("❌ Failed to seed default call outcomes:", err.message);
    }
};

const createCallOutcome = async (outcomeName, addedBy, deviceId) => {
    const query = `INSERT INTO call_outcome_master (outcome_name, added_by, device_id) VALUES (?, ?, ?)`;
    const [result] = await db.execute(query, [outcomeName, addedBy, deviceId]);
    return result;
};

const getAllCallOutcomes = async () => {
    const query = `
        SELECT
            com.id,
            com.outcome_name,
            COALESCE(u.name, 'Unknown') AS added_by_name,
            com.device_id,
            com.timestamp
        FROM call_outcome_master com
        LEFT JOIN users u ON com.added_by = u.id
        ORDER BY com.timestamp DESC
    `;
    const [results] = await db.execute(query);
    return results;
};

const updateCallOutcome = async (id, outcomeName) => {
    const query = `UPDATE call_outcome_master SET outcome_name = ? WHERE id = ?`;
    const [result] = await db.execute(query, [outcomeName, id]);
    return result;
};

const deleteCallOutcome = async (id) => {
    const query = `DELETE FROM call_outcome_master WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
};

const getCallOutcomeById = async (id) => {
    const query = `
        SELECT id, outcome_name, added_by, device_id, timestamp 
        FROM call_outcome_master 
        WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

module.exports = {
    createCallOutcomesTable,
    createCallOutcome,
    getAllCallOutcomes,
    updateCallOutcome,
    deleteCallOutcome,
    getCallOutcomeById
};
