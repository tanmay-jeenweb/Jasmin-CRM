const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// Helper function to reconciliate and sync items with explicit API IDs
const syncItem = async (connection, tableName, nameColumn, childTables, itemId, itemName, addedBy, deviceId, extraFields = {}) => {
    // 1. Check if the name already exists in the database
    const [rowsByName] = await connection.execute(
        `SELECT id, ${nameColumn} FROM ${tableName} WHERE ${nameColumn} = ?`,
        [itemName]
    );

    if (rowsByName.length > 0) {
        const oldId = rowsByName[0].id;
        if (oldId !== itemId) {
            // The name exists but under a different ID. We need to move it to itemId.
            // First, check if itemId is occupied by another row.
            const [rowsById] = await connection.execute(
                `SELECT id, ${nameColumn} FROM ${tableName} WHERE id = ?`,
                [itemId]
            );

            await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
            if (rowsById.length > 0) {
                // itemId is occupied! Swap the IDs to resolve the conflict.
                const tempId = -oldId;
                
                // Move occupant of itemId to tempId
                await connection.execute(`UPDATE ${tableName} SET id = ? WHERE id = ?`, [tempId, itemId]);
                // Move our item to itemId
                await connection.execute(`UPDATE ${tableName} SET id = ? WHERE id = ?`, [itemId, oldId]);
                // Move occupant to oldId
                await connection.execute(`UPDATE ${tableName} SET id = ? WHERE id = ?`, [oldId, tempId]);

                // Update referencing child tables
                for (const child of childTables) {
                    await connection.execute(`UPDATE ${child.table} SET ${child.column} = ? WHERE ${child.column} = ?`, [tempId, itemId]);
                    await connection.execute(`UPDATE ${child.table} SET ${child.column} = ? WHERE ${child.column} = ?`, [itemId, oldId]);
                    await connection.execute(`UPDATE ${child.table} SET ${child.column} = ? WHERE ${child.column} = ?`, [oldId, tempId]);
                }
            } else {
                // itemId is free! Just change the ID from oldId to itemId.
                await connection.execute(`UPDATE ${tableName} SET id = ? WHERE id = ?`, [itemId, oldId]);
                for (const child of childTables) {
                    await connection.execute(`UPDATE ${child.table} SET ${child.column} = ? WHERE ${child.column} = ?`, [itemId, oldId]);
                }
            }
            await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
            return 'updated';
        } else {
            // ID and Name match! Check if extra fields need update (like for_code)
            if (extraFields.for_code) {
                const [current] = await connection.execute(`SELECT for_code FROM ${tableName} WHERE id = ?`, [itemId]);
                if (current[0].for_code !== extraFields.for_code) {
                    await connection.execute(`UPDATE ${tableName} SET for_code = ? WHERE id = ?`, [extraFields.for_code, itemId]);
                    return 'updated';
                }
            }
            return 'skipped';
        }
    } else {
        // The name does NOT exist. We want to insert it at itemId.
        // First, check if itemId is occupied by another row.
        const [rowsById] = await connection.execute(
            `SELECT id FROM ${tableName} WHERE id = ?`,
            [itemId]
        );

        if (rowsById.length > 0) {
            // itemId is occupied by another name! Move that occupant to a new free ID first.
            const [maxRows] = await connection.execute(`SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM ${tableName}`);
            const freeId = maxRows[0].nextId;

            await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
            await connection.execute(`UPDATE ${tableName} SET id = ? WHERE id = ?`, [freeId, itemId]);
            for (const child of childTables) {
                await connection.execute(`UPDATE ${child.table} SET ${child.column} = ? WHERE ${child.column} = ?`, [freeId, itemId]);
            }
            await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        }

        // Now itemId is guaranteed to be free! Insert the new record.
        const cols = ['id', nameColumn, 'added_by', 'device_id', ...Object.keys(extraFields)];
        const placeholders = cols.map(() => '?').join(', ');
        const vals = [itemId, itemName, addedBy, deviceId, ...Object.values(extraFields)];

        await connection.execute(
            `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders})`,
            vals
        );
        return 'added';
    }
};

const syncMastersController = async (req, res) => {
    try {
        const { syncBrands = true, syncCompanies = true, syncMachines = true } = req.body || {};
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'External Sync';

        // 1. Fetch from external API
        const apiUrl = 'https://interlink.jasminmobile.com/v1/api/external/master-data';
        console.log(`Sync started. Fetching from external URL: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'userid': 'WebSite',
                'Securitycode': '1151-8111-6444-4166',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch master data from external API: status ${response.status}`);
            return res.status(response.status).json({
                success: false,
                message: `Failed to fetch from external API: Server returned ${response.statusText}`
            });
        }

        const responseData = await response.json();
        if (!responseData.success || !responseData.data) {
            console.error(`External API returned unsuccessful response: ${responseData.message}`);
            return res.status(400).json({
                success: false,
                message: responseData.message || 'Failed to fetch master data.'
            });
        }

        const externalData = responseData.data;
        const syncSummary = {
            companyBrands: { added: 0, updated: 0, skipped: 0 },
            mobileBrands: { added: 0, updated: 0, skipped: 0 },
            financeCompanies: { added: 0, updated: 0, skipped: 0 },
            financeMachines: { added: 0, updated: 0, skipped: 0 }
        };

        // Get DB connection for transaction to ensure integrity
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 2. Sync Brands
            if (syncBrands && externalData.brands && Array.isArray(externalData.brands)) {
                for (const item of externalData.brands) {
                    const itemId = item.id;
                    const companyBrandName = (item.brand_name || '').trim();
                    const mobileBrandName = (item.mobile_brand || '').trim();
                    const forCode = item.for_code === 'Yes' ? 'Yes' : 'No';

                    if (!itemId) {
                        continue;
                    }

                    // Company Brand Master Sync
                    if (companyBrandName) {
                        const status = await syncItem(
                            connection,
                            'company_brand_master',
                            'brand_name',
                            [],
                            itemId,
                            companyBrandName,
                            addedBy,
                            deviceId
                        );
                        syncSummary.companyBrands[status]++;
                    }

                    // Mobile Brand Master Sync
                    if (mobileBrandName) {
                        const status = await syncItem(
                            connection,
                            'mobile_brand_master',
                            'mobile_brand',
                            [
                                { table: 'in_process_franchise_mappings', column: 'mobile_brand_id' },
                                { table: 'in_process_franchise_branch_finance_brands', column: 'brand_id' }
                            ],
                            itemId,
                            mobileBrandName,
                            addedBy,
                            deviceId,
                            { for_code: forCode }
                        );
                        syncSummary.mobileBrands[status]++;
                    }
                }
            }

            // 3. Sync Finance Companies (Banks)
            if (syncCompanies && externalData.financeCompanies && Array.isArray(externalData.financeCompanies)) {
                for (const item of externalData.financeCompanies) {
                    const itemId = item.id;
                    const bankCardName = (
                        item.bank_card_name || 
                        item.company_name || 
                        item.name || 
                        item.finance_company || 
                        item.company || 
                        ''
                    ).trim();

                    if (!itemId || !bankCardName) {
                        continue;
                    }

                    const status = await syncItem(
                        connection,
                        'bank_master',
                        'bank_card_name',
                        [
                            { table: 'in_process_franchise_mappings', column: 'bank_id' },
                            { table: 'in_process_franchise_branch_finance_companies', column: 'company_id' }
                        ],
                        itemId,
                        bankCardName,
                        addedBy,
                        deviceId
                    );
                    syncSummary.financeCompanies[status]++;
                }
            }

            // 4. Sync Finance Machines
            if (syncMachines && externalData.financeMachines && Array.isArray(externalData.financeMachines)) {
                for (const item of externalData.financeMachines) {
                    const itemId = item.id;
                    const machineName = (
                        item.machine_name || 
                        item.name || 
                        item.machine || 
                        item.finance_machine || 
                        item.device_name || 
                        ''
                    ).trim();

                    if (!itemId || !machineName) {
                        continue;
                    }

                    const status = await syncItem(
                        connection,
                        'finance_machine_master',
                        'machine_name',
                        [
                            { table: 'in_process_franchise_branch_finance_machines', column: 'machine_id' }
                        ],
                        itemId,
                        machineName,
                        addedBy,
                        deviceId
                    );
                    syncSummary.financeMachines[status]++;
                }
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        // 5. Create Audit Log Entry
        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Master Data Sync',
            'created',
            null,
            syncSummary
        );

        return res.status(200).json({
            success: true,
            message: 'Master data synchronized successfully',
            data: syncSummary
        });

    } catch (error) {
        console.error('Error synchronizing master data:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while syncing master data.'
        });
    }
};

module.exports = {
    syncMastersController
};
