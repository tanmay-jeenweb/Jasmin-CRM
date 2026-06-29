const db = require("../config/db.js");

const createNotesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            inquiry_id INT NOT NULL,
            user_id INT NOT NULL,
            note_text TEXT NOT NULL,
            created_by_device_id VARCHAR(255) NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `;
    try {
        await db.query(query);
        console.log("Notes table ready");
    } catch (err) {
        console.error("Error creating notes table:", err);
        throw err;
    }
};

module.exports = { createNotesTable };
