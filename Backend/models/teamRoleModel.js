const db = require('../config/db.js');

const createTeamRolesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS team_role_master (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role VARCHAR(255) NOT NULL UNIQUE,
            is_required TINYINT(1) DEFAULT 0,
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    await db.execute(query);
    console.log("Team role master table ready");
};

const createTeamRole = async (role, isRequired, addedBy, deviceId) => {
    const query = `INSERT INTO team_role_master (role, is_required, added_by, device_id) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(query, [role, isRequired ? 1 : 0, addedBy, deviceId]);
    return result;
};

const getAllTeamRoles = async () => {
    const query = `
        SELECT
            trm.id,
            trm.role,
            trm.is_required,
            COALESCE(u.name, 'Unknown') AS added_by_name,
            trm.device_id,
            trm.timestamp
        FROM team_role_master trm
        LEFT JOIN users u ON trm.added_by = u.id
        ORDER BY trm.timestamp DESC
    `;
    const [results] = await db.execute(query);
    return results;
};

const updateTeamRole = async (id, role, isRequired) => {
    const query = `UPDATE team_role_master SET role = ?, is_required = ? WHERE id = ?`;
    const [result] = await db.execute(query, [role, isRequired ? 1 : 0, id]);
    return result;
};

const deleteTeamRole = async (id) => {
    const query = `DELETE FROM team_role_master WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
};

const getTeamRoleById = async (id) => {
    const query = `
        SELECT id, role, is_required, added_by, device_id, timestamp 
        FROM team_role_master 
        WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

module.exports = {
    createTeamRolesTable,
    createTeamRole,
    getAllTeamRoles,
    updateTeamRole,
    deleteTeamRole,
    getTeamRoleById
};
