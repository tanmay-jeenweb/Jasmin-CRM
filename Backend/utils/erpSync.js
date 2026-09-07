const db = require('../config/db.js');

/**
 * Sync brand-finance mappings for a franchise to the ERP
 * @param {number} franchiseId 
 * @param {Array} mappingsData - array of { mobile_brand_id, bank_id }
 * @param {string} xSyncSource - source identifier header
 */
async function syncMappingsToErp(franchiseId, mappingsData, xSyncSource = 'JASMIN-CRM') {
    try {
        const rawErpUrl = process.env.ERP_API_URL || process.env.EXTERNAL_BRANCH_API_URL || '';
        const erpUrl = rawErpUrl.replace(/\/$/, '');
        const userid = process.env.ERP_SYNC_USERID || process.env.EXTERNAL_BRANCH_API_USERID;
        const securitycode = process.env.ERP_SYNC_SECURITYCODE || process.env.EXTERNAL_BRANCH_API_SECURITY_CODE;

        if (!erpUrl || !userid || !securitycode) {
            console.warn('[SYNC] Outbound sync skipped: ERP API configuration missing in .env');
            return;
        }

        // Fetch mapped branch code for franchise
        const [mappingRows] = await db.execute(
            'SELECT branch_code FROM branch_franchise_mappings WHERE franchise_id = ?',
            [franchiseId]
        );

        if (mappingRows.length === 0) {
            console.warn(`[SYNC] Outbound sync skipped: Franchise ID ${franchiseId} is not mapped to a branch.`);
            return;
        }

        const branchCode = mappingRows[0].branch_code;
        const targetUrl = `${erpUrl}/v1/api/external/sync/brand-finance-relations/${encodeURIComponent(branchCode)}`;

        // Map internal structure to ERP expectation
        const payload = {
            relations: mappingsData.map(m => ({
                brand_id: m.mobile_brand_id || m.brand_id,
                company_id: m.bank_id || m.company_id
            }))
        };

        console.log(`[SYNC] Sending mappings sync to ERP for branch: ${branchCode}`);

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'userid': userid,
                'securitycode': securitycode,
                'x-sync-source': xSyncSource,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[SYNC] ERP Mapping Sync failed with status ${response.status}: ${errText}`);
        } else {
            console.log(`[SYNC] ERP Mapping Sync succeeded for branch ${branchCode}`);
        }
    } catch (error) {
        console.error(`[SYNC] Error during outbound mappings sync:`, error);
    }
}

/**
 * Sync branch finance codes for a franchise to the ERP
 * @param {number} franchiseId 
 * @param {Object} financeData - contains { brands, machines, companies, details }
 * @param {string} xSyncSource - source identifier header
 */
async function syncFinanceCodesToErp(franchiseId, financeData, xSyncSource = 'JASMIN-CRM') {
    try {
        const rawErpUrl = process.env.ERP_API_URL || process.env.EXTERNAL_BRANCH_API_URL || '';
        const erpUrl = rawErpUrl.replace(/\/$/, '');
        const userid = process.env.ERP_SYNC_USERID || process.env.EXTERNAL_BRANCH_API_USERID;
        const securitycode = process.env.ERP_SYNC_SECURITYCODE || process.env.EXTERNAL_BRANCH_API_SECURITY_CODE;

        if (!erpUrl || !userid || !securitycode) {
            console.warn('[SYNC] Outbound sync skipped: ERP API configuration missing in .env');
            return;
        }

        // Fetch mapped branch code for franchise
        const [mappingRows] = await db.execute(
            'SELECT branch_code FROM branch_franchise_mappings WHERE franchise_id = ?',
            [franchiseId]
        );

        if (mappingRows.length === 0) {
            console.warn(`[SYNC] Outbound sync skipped: Franchise ID ${franchiseId} is not mapped to a branch.`);
            return;
        }

        const branchCode = mappingRows[0].branch_code;
        const targetUrl = `${erpUrl}/v1/api/external/sync/finance-codes/${encodeURIComponent(branchCode)}`;

        // Map internal formats to ERP schema
        const payload = {
            brands: (financeData.brands || []).map(b => ({
                brand_id: b.brand_id,
                brand_code: b.brand_code
            })),
            machines: (financeData.machines || []).map(m => ({
                machine_id: m.machine_id,
                tid: m.tid,
                pos_id: m.pos_id,
                serial_no: m.serial_no
            })),
            companies: (financeData.companies || []).map(c => ({
                company_id: c.company_id,
                company_code: c.company_code
            })),
            details: financeData.details || {}
        };

        console.log(`[SYNC] Sending finance codes sync to ERP for branch: ${branchCode}`);

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'userid': userid,
                'securitycode': securitycode,
                'x-sync-source': xSyncSource,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[SYNC] ERP Finance Codes Sync failed with status ${response.status}: ${errText}`);
        } else {
            console.log(`[SYNC] ERP Finance Codes Sync succeeded for branch ${branchCode}`);
        }
    } catch (error) {
        console.error(`[SYNC] Error during outbound finance codes sync:`, error);
    }
}

module.exports = {
    syncMappingsToErp,
    syncFinanceCodesToErp
};
