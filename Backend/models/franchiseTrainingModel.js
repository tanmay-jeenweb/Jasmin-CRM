const db = require('../config/db.js');

const TRAINING_MODULES = [
    "APX software",
    "Finance",
    "Swipe",
    "Price list",
    "Contacts details department wise",
    "DFM (monthly working)",
    "Scanner"
];

const createFranchiseTrainingTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS in_process_franchise_training (
            id INT AUTO_INCREMENT PRIMARY KEY,
            in_process_franchise_id INT NOT NULL,
            module_name VARCHAR(100) NOT NULL,
            is_done TINYINT(1) DEFAULT 0,
            trainer_name VARCHAR(100) NULL,
            person_name VARCHAR(100) NULL,
            phone_number VARCHAR(20) NULL,
            training_date DATE NULL,
            submitted_by INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (in_process_franchise_id) REFERENCES in_process_franchises(id) ON DELETE CASCADE,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY (in_process_franchise_id, module_name)
        )
    `;
    await db.execute(query);
    console.log("In Process Franchise Training table ready");
};

const getFranchiseTrainingByFranchiseId = async (franchiseId) => {
    const query = `
        SELECT * FROM in_process_franchise_training 
        WHERE in_process_franchise_id = ?
    `;
    const [rows] = await db.execute(query, [franchiseId]);
    
    // Map existing rows to a dictionary for easy lookup
    const rowMap = {};
    rows.forEach(r => {
        rowMap[r.module_name] = r;
    });

    // Always return all 7 modules in order
    return TRAINING_MODULES.map(moduleName => {
        if (rowMap[moduleName]) {
            return rowMap[moduleName];
        } else {
            return {
                in_process_franchise_id: franchiseId,
                module_name: moduleName,
                is_done: 0,
                trainer_name: "",
                person_name: "",
                phone_number: "",
                training_date: null
            };
        }
    });
};

const saveFranchiseTraining = async (franchiseId, modules, submittedBy) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Delete existing training entries for this franchise
        const deleteQuery = `DELETE FROM in_process_franchise_training WHERE in_process_franchise_id = ?`;
        await connection.execute(deleteQuery, [franchiseId]);

        // 2. Insert new training entries
        if (modules && modules.length > 0) {
            const insertQuery = `
                INSERT INTO in_process_franchise_training (
                    in_process_franchise_id, module_name, is_done, trainer_name, person_name, phone_number, training_date, submitted_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            for (const m of modules) {
                const isDoneVal = m.is_done ? 1 : 0;
                const trainerNameVal = m.trainer_name ? m.trainer_name.trim() : null;
                const personNameVal = m.person_name ? m.person_name.trim() : null;
                const phoneNumberVal = m.phone_number ? m.phone_number.trim() : null;
                const trainingDateVal = m.training_date || null;

                await connection.execute(insertQuery, [
                    franchiseId,
                    m.module_name,
                    isDoneVal,
                    trainerNameVal,
                    personNameVal,
                    phoneNumberVal,
                    trainingDateVal,
                    submittedBy
                ]);
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
    createFranchiseTrainingTable,
    getFranchiseTrainingByFranchiseId,
    saveFranchiseTraining
};
