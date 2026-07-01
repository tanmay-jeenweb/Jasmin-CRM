const db = require('../config/db.js');

const createFranchiseBranchFinanceCodeTables = async () => {
    // 1. Brands finance codes table
    const brandsQuery = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_branch_finance_brands (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL,
            brand_id INT NOT NULL,
            brand_code VARCHAR(255) DEFAULT '',
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (brand_id) REFERENCES mobile_brand_master(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY (in_process_franchise_id, brand_id)
        )
    `;
    await db.execute(brandsQuery);

    // 2. Machines finance codes table
    const machinesQuery = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_branch_finance_machines (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL,
            machine_id INT NOT NULL,
            tid VARCHAR(255) DEFAULT '',
            pos_id VARCHAR(255) DEFAULT '',
            serial_no VARCHAR(255) DEFAULT '',
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (machine_id) REFERENCES finance_machine_master(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY (in_process_franchise_id, machine_id)
        )
    `;
    await db.execute(machinesQuery);

    // 3. Companies finance codes table
    const companiesQuery = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_branch_finance_companies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL,
            company_id INT NOT NULL,
            company_code VARCHAR(255) DEFAULT '',
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES bank_master(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY (in_process_franchise_id, company_id)
        )
    `;
    await db.execute(companiesQuery);
    console.log("In Process Franchise Branch Finance Code tables ready");
};

const getFranchiseBranchFinanceCodesByFranchiseId = async (franchiseId) => {
    // 1. Fetch brands
    const brandsQuery = `
        SELECT 
            mbm.id AS brand_id,
            mbm.mobile_brand AS brand_name,
            COALESCE(ffb.brand_code, '') AS brand_code
        FROM mobile_brand_master mbm
        LEFT JOIN in_process_franchise_branch_finance_brands ffb 
            ON mbm.id = ffb.brand_id AND ffb.in_process_franchise_id = ?
        ORDER BY mbm.mobile_brand ASC
    `;
    const [brands] = await db.execute(brandsQuery, [franchiseId]);

    // 2. Fetch machines
    const machinesQuery = `
        SELECT 
            fmm.id AS machine_id,
            fmm.machine_name AS machine_name,
            COALESCE(ffm.tid, '') AS tid,
            COALESCE(ffm.pos_id, '') AS pos_id,
            COALESCE(ffm.serial_no, '') AS serial_no
        FROM finance_machine_master fmm
        LEFT JOIN in_process_franchise_branch_finance_machines ffm 
            ON fmm.id = ffm.machine_id AND ffm.in_process_franchise_id = ?
        ORDER BY fmm.machine_name ASC
    `;
    const [machines] = await db.execute(machinesQuery, [franchiseId]);

    // 3. Fetch companies
    const companiesQuery = `
        SELECT 
            bm.id AS company_id,
            bm.bank_card_name AS company_name,
            COALESCE(ffc.company_code, '') AS company_code
        FROM bank_master bm
        LEFT JOIN in_process_franchise_branch_finance_companies ffc 
            ON bm.id = ffc.company_id AND ffc.in_process_franchise_id = ?
        ORDER BY bm.bank_card_name ASC
    `;
    const [companies] = await db.execute(companiesQuery, [franchiseId]);

    return { brands, machines, companies };
};

const saveFranchiseBranchFinanceCodes = async (franchiseId, data, submittedBy) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Save Brands (Delete first then Insert if not empty)
        await connection.execute(`DELETE FROM in_process_franchise_branch_finance_brands WHERE in_process_franchise_id = ?`, [franchiseId]);
        if (data.brands && data.brands.length > 0) {
            const insertBrandQuery = `
                INSERT INTO in_process_franchise_branch_finance_brands (in_process_franchise_id, brand_id, brand_code, submitted_by)
                VALUES (?, ?, ?, ?)
            `;
            for (const b of data.brands) {
                if (b.brand_code && b.brand_code.trim()) {
                    await connection.execute(insertBrandQuery, [franchiseId, b.brand_id, b.brand_code.trim(), submittedBy]);
                }
            }
        }

        // 2. Save Machines (Delete first then Insert if not empty)
        await connection.execute(`DELETE FROM in_process_franchise_branch_finance_machines WHERE in_process_franchise_id = ?`, [franchiseId]);
        if (data.machines && data.machines.length > 0) {
            const insertMachineQuery = `
                INSERT INTO in_process_franchise_branch_finance_machines (in_process_franchise_id, machine_id, tid, pos_id, serial_no, submitted_by)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            for (const m of data.machines) {
                if ((m.tid && m.tid.trim()) || (m.pos_id && m.pos_id.trim()) || (m.serial_no && m.serial_no.trim())) {
                    await connection.execute(insertMachineQuery, [
                        franchiseId,
                        m.machine_id,
                        (m.tid || '').trim(),
                        (m.pos_id || '').trim(),
                        (m.serial_no || '').trim(),
                        submittedBy
                    ]);
                }
            }
        }

        // 3. Save Companies (Delete first then Insert if not empty)
        await connection.execute(`DELETE FROM in_process_franchise_branch_finance_companies WHERE in_process_franchise_id = ?`, [franchiseId]);
        if (data.companies && data.companies.length > 0) {
            const insertCompanyQuery = `
                INSERT INTO in_process_franchise_branch_finance_companies (in_process_franchise_id, company_id, company_code, submitted_by)
                VALUES (?, ?, ?, ?)
            `;
            for (const c of data.companies) {
                if (c.company_code && c.company_code.trim()) {
                    await connection.execute(insertCompanyQuery, [franchiseId, c.company_id, c.company_code.trim(), submittedBy]);
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
    createFranchiseBranchFinanceCodeTables,
    getFranchiseBranchFinanceCodesByFranchiseId,
    saveFranchiseBranchFinanceCodes
};
