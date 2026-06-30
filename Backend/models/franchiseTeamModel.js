const db = require('../config/db.js');

const createFranchiseTeamTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_teams (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL,
            team_role_id INT NOT NULL,
            count INT NOT NULL DEFAULT 0,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (team_role_id) REFERENCES team_role_master(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY (in_process_franchise_id, team_role_id)
        )
    `;
    await db.execute(query);
    console.log("In Process Franchise Teams table ready");
};

const getFranchiseTeamByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            trm.id AS role_id,
            trm.role AS role_name,
            trm.is_required,
            COALESCE(ft.count, 0) AS count,
            IF(ft.id IS NOT NULL, 1, 0) AS is_selected
        FROM team_role_master trm
        LEFT JOIN in_process_franchise_teams ft 
            ON trm.id = ft.team_role_id AND ft.in_process_franchise_id = ?
        ORDER BY trm.timestamp DESC
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows;
};

const saveFranchiseTeam = async (franchiseId, roles, submittedBy) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Delete existing roles for this franchise
        const deleteQuery = `DELETE FROM in_process_franchise_teams WHERE in_process_franchise_id = ?`;
        await connection.execute(deleteQuery, [franchiseId]);

        // 2. Insert new selected roles
        if (roles && roles.length > 0) {
            const insertQuery = `
                INSERT INTO in_process_franchise_teams (in_process_franchise_id, team_role_id, count, submitted_by)
                VALUES (?, ?, ?, ?)
            `;
            for (const item of roles) {
                // Only insert if selected/checked
                if (item.is_selected || item.count > 0) {
                    await connection.execute(insertQuery, [franchiseId, item.role_id, item.count || 0, submittedBy]);
                }
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
    createFranchiseTeamTable,
    getFranchiseTeamByFranchiseId,
    saveFranchiseTeam
};
