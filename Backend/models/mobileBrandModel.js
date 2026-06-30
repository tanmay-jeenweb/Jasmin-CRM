const db = require('../config/db.js');

const createMobileBrandsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS mobile_brand_master (
            id INT AUTO_INCREMENT PRIMARY KEY,
            mobile_brand VARCHAR(255) NOT NULL UNIQUE,
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    await db.execute(query);
    console.log("Mobile brand master table ready");
};

const createMobileBrand = async (mobileBrand, addedBy, deviceId) => {
    const query = `INSERT INTO mobile_brand_master (mobile_brand, added_by, device_id) VALUES (?, ?, ?)`;
    const [result] = await db.execute(query, [mobileBrand, addedBy, deviceId]);
    return result;
};

const getAllMobileBrands = async () => {
    const query = `
        SELECT
            mbm.id,
            mbm.mobile_brand,
            COALESCE(u.name, 'Unknown') AS added_by_name,
            mbm.device_id,
            mbm.timestamp
        FROM mobile_brand_master mbm
        LEFT JOIN users u ON mbm.added_by = u.id
        ORDER BY mbm.timestamp DESC
    `;
    const [results] = await db.execute(query);
    return results;
};

const updateMobileBrand = async (id, mobileBrand) => {
    const query = `UPDATE mobile_brand_master SET mobile_brand = ? WHERE id = ?`;
    const [result] = await db.execute(query, [mobileBrand, id]);
    return result;
};

const deleteMobileBrand = async (id) => {
    const query = `DELETE FROM mobile_brand_master WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
};

const getMobileBrandById = async (id) => {
    const query = `
        SELECT id, mobile_brand, added_by, device_id, timestamp 
        FROM mobile_brand_master 
        WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

module.exports = {
    createMobileBrandsTable,
    createMobileBrand,
    getAllMobileBrands,
    updateMobileBrand,
    deleteMobileBrand,
    getMobileBrandById
};
