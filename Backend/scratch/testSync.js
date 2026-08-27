require("dotenv").config();
const db = require("../config/db.js");
const { initUserModel } = require("../models/userModel.js");
const { createFranchiseBranchFinanceCodeTables } = require("../models/franchiseBranchFinanceCodeModel.js");
const { createBranchFranchiseMappingTables } = require("../models/branchFranchiseMappingModel.js");
const { createFranchiseMappingTable } = require("../models/franchiseMappingModel.js");
const { createInProcessFranchiseTable } = require("../models/inProcessFranchiseModel.js");

const {
    syncMappingsController,
    syncFinanceCodesController
} = require("../controllers/franchiseSyncController.js");

// Mock Express Response Object
const mockResponse = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.jsonData = data;
        return res;
    };
    return res;
};

async function runTests() {
    console.log("--- STARTING INTEGRATION TESTS FOR 2-WAY SYNC ---");

    try {
        // Ensure all tables exist first
        console.log("Initializing database tables for tests...");
        await initUserModel();
        await createInProcessFranchiseTable();
        await createBranchFranchiseMappingTables();
        await createFranchiseMappingTable();
        await createFranchiseBranchFinanceCodeTables();

        // 1. Setup Mock Data
        console.log("\nSetting up mock data...");
        // Ensure a user exists for foreign key constraint (submitted_by)
        const [userRows] = await db.execute("SELECT id FROM users LIMIT 1");
        let userId = 1;
        if (userRows.length === 0) {
            console.log("Creating mock user...");
            await db.execute(
                `INSERT INTO users (id, name, username, email, password, role, active)
                 VALUES (1, 'Test Admin', 'test_admin', 'test@example.com', 'pass', 'admin', 1)`
            );
        } else {
            userId = userRows[0].id;
        }

        // Create mock franchise 999
        await db.execute("DELETE FROM in_process_franchises WHERE id = 999");
        await db.execute(
            `INSERT INTO in_process_franchises (id, partner_name, partner_mobile, partner_email, city, district, state, store_name, bdm_area, inquiry_manager_id, added_by)
             VALUES (999, 'Test Partner', '1234567890', 'partner@test.com', 'City', 'District', 'State', 'Test Store', 'Test Area', ?, ?)`
        , [userId, userId]);

        // Create mock external branch
        await db.execute("DELETE FROM external_branches WHERE branch_code = 'BR-TEST-999'");
        await db.execute(
            `INSERT INTO external_branches (branch_code, branch_name)
             VALUES ('BR-TEST-999', 'Mock Branch 999')`
        );

        // Map franchise 999 to branch BR-TEST-999
        await db.execute("DELETE FROM branch_franchise_mappings WHERE franchise_id = 999");
        await db.execute(
            `INSERT INTO branch_franchise_mappings (franchise_id, branch_code, submitted_by)
             VALUES (999, 'BR-TEST-999', ?)`
        , [userId]);

        // Ensure mock mobile brand and bank exist in database
        const [brandRows] = await db.execute("SELECT id FROM mobile_brand_master LIMIT 1");
        let brandId = 1;
        if (brandRows.length === 0) {
            await db.execute("INSERT INTO mobile_brand_master (id, mobile_brand, added_by) VALUES (1, 'Apple', ?)", [userId]);
        } else {
            brandId = brandRows[0].id;
        }

        const [bankRows] = await db.execute("SELECT id FROM bank_master LIMIT 1");
        let bankId = 1;
        if (bankRows.length === 0) {
            await db.execute("INSERT INTO bank_master (id, bank_card_name, added_by) VALUES (1, 'Bajaj', ?)", [userId]);
        } else {
            bankId = bankRows[0].id;
        }

        console.log(`Resolved IDs - User: ${userId}, Franchise: 999, Brand: ${brandId}, Bank: ${bankId}`);

        // Set up test credentials from environment
        process.env.ERP_SYNC_USERID = process.env.ERP_SYNC_USERID || "WebSite";
        process.env.ERP_SYNC_SECURITYCODE = process.env.ERP_SYNC_SECURITYCODE || "1151-8111-6444-4166";

        // --- TEST CASE 1: Unauthorized incoming sync ---
        console.log("\n[TEST 1] Testing unauthorized incoming sync...");
        const req1 = {
            headers: {},
            params: { branchId: "BR-TEST-999" },
            body: { mappings: [] }
        };
        const res1 = mockResponse();
        await syncMappingsController(req1, res1);
        if (res1.statusCode === 401) {
            console.log("✅ TEST 1 PASSED: Unauthorized request correctly blocked with status 401.");
        } else {
            throw new Error(`TEST 1 FAILED: Expected 401 but got ${res1.statusCode}`);
        }

        // --- TEST CASE 2: Invalid branch lookup ---
        console.log("\n[TEST 2] Testing mapping sync with non-existent branchId...");
        const req2 = {
            headers: {
                userid: process.env.ERP_SYNC_USERID,
                securitycode: process.env.ERP_SYNC_SECURITYCODE
            },
            params: { branchId: "NON-EXISTENT-BRANCH" },
            body: { mappings: [] }
        };
        const res2 = mockResponse();
        await syncMappingsController(req2, res2);
        if (res2.statusCode === 404) {
            console.log("✅ TEST 2 PASSED: Invalid branch correctly returned 404.");
        } else {
            throw new Error(`TEST 2 FAILED: Expected 404 but got ${res2.statusCode}`);
        }

        // --- TEST CASE 3: Successful sync mappings ---
        console.log("\n[TEST 3] Testing successful mappings sync...");
        const req3 = {
            headers: {
                userid: process.env.ERP_SYNC_USERID,
                securitycode: process.env.ERP_SYNC_SECURITYCODE
            },
            params: { branchId: "BR-TEST-999" },
            body: {
                mappings: [
                    { brand_id: brandId, company_id: bankId }
                ]
            }
        };
        const res3 = mockResponse();
        await syncMappingsController(req3, res3);
        if (res3.statusCode === 200 && res3.jsonData.success === true) {
            console.log("✅ TEST 3 PASSED: Sync mappings succeeded with status 200.");
            
            // Verify in DB
            const [rows] = await db.execute("SELECT * FROM in_process_franchise_mappings WHERE in_process_franchise_id = 999");
            if (rows.length === 1 && rows[0].mobile_brand_id === brandId && rows[0].bank_id === bankId) {
                console.log("   └─ Database verification: Mapping verified successfully in DB.");
            } else {
                throw new Error("TEST 3 FAILED: Mapping not correctly saved in DB");
            }
        } else {
            throw new Error(`TEST 3 FAILED: Expected 200 with success=true but got ${res3.statusCode} with: ${JSON.stringify(res3.jsonData)}`);
        }

        // --- TEST CASE 4: Successful sync finance codes + details ---
        console.log("\n[TEST 4] Testing successful finance codes and details sync...");
        
        // Ensure machine exists
        const [machineRows] = await db.execute("SELECT id FROM finance_machine_master LIMIT 1");
        let machineId = 1;
        if (machineRows.length === 0) {
            await db.execute("INSERT INTO finance_machine_master (id, machine_name, added_by) VALUES (1, 'HDFC Swipe', ?)", [userId]);
        } else {
            machineId = machineRows[0].id;
        }

        const req4 = {
            headers: {
                userid: process.env.ERP_SYNC_USERID,
                securitycode: process.env.ERP_SYNC_SECURITYCODE
            },
            params: { branchId: "BR-TEST-999" },
            body: {
                brands: [
                    { brand_id: brandId, brand_code: "MOCK-BR-CODE-1" }
                ],
                machines: [
                    { machine_id: machineId, tid: "TID-999", pos_id: "POS-999", serial_no: "SN-999" }
                ],
                companies: [
                    { company_id: bankId, company_code: "COMP-CODE-999" }
                ],
                details: {
                    qr_code_id_password: "sync_user:sync_pass_999",
                    remarks: "Integration sync test remarks"
                }
            }
        };
        const res4 = mockResponse();
        await syncFinanceCodesController(req4, res4);
        if (res4.statusCode === 200 && res4.jsonData.success === true) {
            console.log("✅ TEST 4 PASSED: Sync finance codes succeeded with status 200.");
            
            // Verify in DB
            const [bRows] = await db.execute("SELECT * FROM in_process_franchise_branch_finance_brands WHERE in_process_franchise_id = 999");
            const [mRows] = await db.execute("SELECT * FROM in_process_franchise_branch_finance_machines WHERE in_process_franchise_id = 999");
            const [cRows] = await db.execute("SELECT * FROM in_process_franchise_branch_finance_companies WHERE in_process_franchise_id = 999");
            const [dRows] = await db.execute("SELECT * FROM in_process_franchise_branch_finance_details WHERE in_process_franchise_id = 999");

            if (
                bRows.length === 1 && bRows[0].brand_code === "MOCK-BR-CODE-1" &&
                mRows.length === 1 && mRows[0].tid === "TID-999" && mRows[0].pos_id === "POS-999" &&
                cRows.length === 1 && cRows[0].company_code === "COMP-CODE-999" &&
                dRows.length === 1 && dRows[0].qr_code_id_password === "sync_user:sync_pass_999" && dRows[0].remarks === "Integration sync test remarks"
            ) {
                console.log("   └─ Database verification: All finance codes and sync details verified successfully in DB.");
            } else {
                throw new Error("TEST 4 FAILED: Finance codes / sync details not correctly saved in DB");
            }
        } else {
            throw new Error(`TEST 4 FAILED: Expected 200 with success=true but got ${res4.statusCode} with: ${JSON.stringify(res4.jsonData)}`);
        }

        // 5. Cleanup Mock Data
        console.log("\nCleaning up mock data...");
        await db.execute("DELETE FROM in_process_franchise_mappings WHERE in_process_franchise_id = 999");
        await db.execute("DELETE FROM in_process_franchise_branch_finance_brands WHERE in_process_franchise_id = 999");
        await db.execute("DELETE FROM in_process_franchise_branch_finance_machines WHERE in_process_franchise_id = 999");
        await db.execute("DELETE FROM in_process_franchise_branch_finance_companies WHERE in_process_franchise_id = 999");
        await db.execute("DELETE FROM in_process_franchise_branch_finance_details WHERE in_process_franchise_id = 999");
        await db.execute("DELETE FROM branch_franchise_mappings WHERE franchise_id = 999");
        await db.execute("DELETE FROM in_process_franchises WHERE id = 999");
        await db.execute("DELETE FROM external_branches WHERE branch_code = 'BR-TEST-999'");

        console.log("\nALL SYNC INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🎉");
        process.exit(0);

    } catch (err) {
        console.error("\n❌ TEST RUN FAILED WITH ERROR:");
        console.error(err);
        process.exit(1);
    }
}

runTests();
