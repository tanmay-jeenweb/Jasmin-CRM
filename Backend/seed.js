require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/db.js");

async function seed() {
    try {
        console.log("Connecting to database...");
        const connection = await db.getConnection();
        connection.release();
        console.log("Connected.\n");

        // Check if admin already exists
        const [existing] = await db.execute(
            "SELECT id FROM users WHERE username = ?",
            ["admin"]
        );

        if (existing.length > 0) {
            console.log("⚠️  Admin user already exists. Skipping seed.");
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        // Insert admin user
        await db.execute(
            `INSERT INTO users (name, username, email, password, role, active, device_verification_required)
             VALUES (?, ?, ?, ?, 'admin', 1, 0)`,
            ["Super Admin", "admin", "admin@erp2.com", hashedPassword]
        );

        console.log("✅ Admin user created successfully!\n");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("  Username : admin");
        console.log("  Password : Admin@123");
        console.log("  Role     : admin");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\nYou can now log in at the frontend.");

    } catch (error) {
        console.error("Seed failed:", error.message);
    } finally {
        process.exit(0);
    }
}

seed();
