const bcrypt = require("bcryptjs");
const readline = require("readline");

async function generateHash(plainPassword) {
    if (!plainPassword || plainPassword.trim() === "") {
        console.error("❌ Error: Password cannot be empty.");
        process.exit(1);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    console.log("\n=======================================================");
    console.log("  🔑 BCRYPT PASSWORD GENERATOR (Jasmin CRM)");
    console.log("=======================================================");
    console.log(`Plain Password : ${plainPassword}`);
    console.log(`Bcrypt Hash    : ${hashedPassword}`);
    console.log("-------------------------------------------------------");
    console.log("📋 Sample SQL Queries:");
    console.log(`-- Update existing user password:`);
    console.log(`UPDATE users SET password = '${hashedPassword}' WHERE username = 'YOUR_USERNAME';\n`);
    console.log(`-- Or by User ID:`);
    console.log(`UPDATE users SET password = '${hashedPassword}' WHERE id = 1;`);
    console.log("=======================================================\n");
}

const inputPassword = process.argv[2];

if (inputPassword) {
    generateHash(inputPassword);
} else {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Enter the plain password to hash: ", async (answer) => {
        rl.close();
        await generateHash(answer.trim());
    });
}
