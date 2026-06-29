const db = require('../config/db.js');

const createCompanyBrandsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS company_brand_master (
            id INT AUTO_INCREMENT PRIMARY KEY,
            brand_name VARCHAR(255) NOT NULL UNIQUE,
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    await db.execute(query);
    console.log("Company brand master table ready");
};

const createCompanyBrand = async (brandName, addedBy, deviceId) => {
    const query = `INSERT INTO company_brand_master (brand_name, added_by, device_id) VALUES (?, ?, ?)`;
    const [result] = await db.execute(query, [brandName, addedBy, deviceId]);
    return result;
};

const getAllCompanyBrands = async () => {
    const query = `
        SELECT
            cbm.id,
            cbm.brand_name,
            COALESCE(u.name, 'Unknown') AS added_by_name,
            cbm.device_id,
            cbm.timestamp
        FROM company_brand_master cbm
        LEFT JOIN users u ON cbm.added_by = u.id
        ORDER BY cbm.timestamp DESC
    `;
    const [results] = await db.execute(query);
    return results;
};

const updateCompanyBrand = async (id, brandName) => {
    const query = `UPDATE company_brand_master SET brand_name = ? WHERE id = ?`;
    const [result] = await db.execute(query, [brandName, id]);
    return result;
};

const deleteCompanyBrand = async (id) => {
    const query = `DELETE FROM company_brand_master WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
};

const getCompanyBrandById = async (id) => {
    const query = `
        SELECT id, brand_name, added_by, device_id, timestamp 
        FROM company_brand_master 
        WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
};

module.exports = {
    createCompanyBrandsTable,
    createCompanyBrand,
    getAllCompanyBrands,
    updateCompanyBrand,
    deleteCompanyBrand,
    getCompanyBrandById
};
