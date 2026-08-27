const db = require('../config/db.js');

const createBranchFranchiseMappingTables = async () => {
    // 1. Create external branches table
    const createBranchesTableQuery = `
        CREATE TABLE IF NOT EXISTS external_branches (
            id INT AUTO_INCREMENT PRIMARY KEY,
            branch_code VARCHAR(50) NOT NULL UNIQUE,
            branch_name VARCHAR(255) NOT NULL,
            branch_city VARCHAR(255) DEFAULT '',
            branch_state VARCHAR(255) DEFAULT '',
            branch_status VARCHAR(50) DEFAULT 'Active',
            synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    await db.execute(createBranchesTableQuery);
    console.log("External branches table ready");

    // 2. Create branch franchise mappings table
    const createMappingsTableQuery = `
        CREATE TABLE IF NOT EXISTS branch_franchise_mappings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            franchise_id INT NOT NULL UNIQUE,
            branch_code VARCHAR(50) NOT NULL UNIQUE,
            submitted_by INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (branch_code) REFERENCES external_branches(branch_code) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(createMappingsTableQuery);
    console.log("Branch franchise mappings table ready");

    // Enforce UNIQUE key constraint on branch_code for existing tables (1-to-1 mapping)
    try {
        const addUniqueConstraintQuery = `
            ALTER TABLE branch_franchise_mappings 
            ADD CONSTRAINT unique_branch_code UNIQUE (branch_code)
        `;
        await db.execute(addUniqueConstraintQuery);
        console.log("Added UNIQUE constraint on branch_code to branch_franchise_mappings table");
    } catch (err) {
        if (err.code !== 'ER_DUP_KEYNAME') {
            console.warn("Could not add unique constraint on branch_code: ", err.message);
        }
    }
};

const syncBranches = async (branches) => {
    const query = `
        INSERT INTO external_branches (branch_code, branch_name, branch_city, branch_state, branch_status)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            branch_name = VALUES(branch_name),
            branch_city = VALUES(branch_city),
            branch_state = VALUES(branch_state),
            branch_status = VALUES(branch_status)
    `;

    let inserted = 0;
    let updated = 0;

    for (const b of branches) {
        const branchCode = b.BRANCH_CODE || '';
        const branchName = b.BRANCH_NAME || '';
        const branchCity = b.BRANCH_CITY || '';
        const branchState = b.BRANCH_STATE || '';
        const branchStatus = b.BRANCH_STATUS || 'Active';

        if (branchCode && branchName) {
            const [result] = await db.execute(query, [
                branchCode,
                branchName,
                branchCity,
                branchState,
                branchStatus
            ]);
            if (result.affectedRows === 1) {
                inserted++;
            } else if (result.affectedRows === 2) {
                updated++;
            }
        }
    }

    return { inserted, updated, total: branches.length };
};

const getUnmappedFranchises = async () => {
    const query = `
        SELECT 
            ipf.id, 
            ipf.store_name, 
            ipf.partner_name, 
            ipf.city, 
            ipf.district, 
            ipf.state
        FROM in_process_franchises ipf
        WHERE ipf.status = 'completed'
          AND ipf.id NOT IN (SELECT franchise_id FROM branch_franchise_mappings)
        ORDER BY ipf.store_name ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
};

const getUnmappedBranches = async () => {
    const query = `
        SELECT 
            eb.branch_code, 
            eb.branch_name, 
            eb.branch_city, 
            eb.branch_state, 
            eb.branch_status
        FROM external_branches eb
        WHERE eb.branch_status = 'Active'
          AND eb.branch_code NOT IN (SELECT branch_code FROM branch_franchise_mappings)
        ORDER BY eb.branch_name ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
};

const getAllMappings = async () => {
    const query = `
        SELECT 
            bfm.id,
            bfm.franchise_id,
            bfm.branch_code,
            bfm.created_at,
            ipf.store_name AS franchise_name,
            eb.branch_name AS branch_name,
            u.name AS submitted_by_name
        FROM branch_franchise_mappings bfm
        JOIN in_process_franchises ipf ON bfm.franchise_id = ipf.id
        JOIN external_branches eb ON bfm.branch_code = eb.branch_code
        LEFT JOIN users u ON bfm.submitted_by = u.id
        ORDER BY bfm.created_at DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
};

const getMappingById = async (id) => {
    const query = `
        SELECT 
            bfm.id,
            bfm.franchise_id,
            bfm.branch_code,
            ipf.store_name AS franchise_name,
            eb.branch_name AS branch_name
        FROM branch_franchise_mappings bfm
        JOIN in_process_franchises ipf ON bfm.franchise_id = ipf.id
        JOIN external_branches eb ON bfm.branch_code = eb.branch_code
        WHERE bfm.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

const createMapping = async (franchiseId, branchCode, submittedBy) => {
    const query = `
        INSERT INTO branch_franchise_mappings (franchise_id, branch_code, submitted_by)
        VALUES (?, ?, ?)
    `;
    const [result] = await db.execute(query, [franchiseId, branchCode, submittedBy]);
    return result;
};

const deleteMapping = async (id) => {
    const query = `DELETE FROM branch_franchise_mappings WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
};

const getMappingByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT 
            bfm.id,
            bfm.branch_code,
            eb.branch_name,
            eb.branch_city,
            eb.branch_state,
            bfm.created_at
        FROM branch_franchise_mappings bfm
        JOIN external_branches eb ON bfm.branch_code = eb.branch_code
        WHERE bfm.franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    return rows[0] || null;
};

module.exports = {
    createBranchFranchiseMappingTables,
    syncBranches,
    getUnmappedFranchises,
    getUnmappedBranches,
    getAllMappings,
    getMappingById,
    createMapping,
    deleteMapping,
    getMappingByFranchiseId
};
