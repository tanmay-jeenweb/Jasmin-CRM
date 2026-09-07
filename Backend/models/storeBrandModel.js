const db = require('../config/db.js');

const createStoreBrandsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS store_brand_master (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            for_code ENUM('Yes', 'No') DEFAULT 'No',
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);

    // Migration helper: Ensure for_code exists in case table was created previously without it
    try {
        const [columns] = await db.execute(`SHOW COLUMNS FROM store_brand_master LIKE 'for_code'`);
        if (columns.length === 0) {
            await db.execute(`ALTER TABLE store_brand_master ADD COLUMN for_code ENUM('Yes', 'No') DEFAULT 'No'`);
            console.log("Added 'for_code' column to 'store_brand_master' table");
        }
    } catch (err) {
        console.error("Error migrating store_brand_master for_code column:", err);
    }

    console.log("Store brand master table ready");
};

const createStoreBrand = async (name, forCode, addedBy, deviceId, id = null) => {
    if (id) {
        const query = `INSERT INTO store_brand_master (id, name, for_code, added_by, device_id) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.execute(query, [id, name, forCode || 'No', addedBy, deviceId]);
        return { ...result, insertId: id };
    } else {
        const query = `INSERT INTO store_brand_master (name, for_code, added_by, device_id) VALUES (?, ?, ?, ?)`;
        const [result] = await db.execute(query, [name, forCode || 'No', addedBy, deviceId]);
        return result;
    }
};

const getAllStoreBrands = async () => {
    const query = `
        SELECT
            sbm.id,
            sbm.name,
            sbm.for_code,
            COALESCE(u.name, 'Unknown') AS added_by_name,
            sbm.device_id,
            sbm.timestamp
        FROM store_brand_master sbm
        LEFT JOIN users u ON sbm.added_by = u.id
        ORDER BY sbm.timestamp DESC
    `;
    const [results] = await db.execute(query);
    return results;
};

const updateStoreBrand = async (id, name, forCode) => {
    const query = `UPDATE store_brand_master SET name = ?, for_code = ? WHERE id = ?`;
    const [result] = await db.execute(query, [name, forCode || 'No', id]);
    return result;
};

const deleteStoreBrand = async (id) => {
    const query = `DELETE FROM store_brand_master WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
};

const getStoreBrandById = async (id) => {
    const query = `
        SELECT id, name, for_code, added_by, device_id, timestamp 
        FROM store_brand_master 
        WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

module.exports = {
    createStoreBrandsTable,
    createStoreBrand,
    getAllStoreBrands,
    updateStoreBrand,
    deleteStoreBrand,
    getStoreBrandById
};
