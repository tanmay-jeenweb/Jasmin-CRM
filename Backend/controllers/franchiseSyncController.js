const db = require('../config/db.js');
const { saveFranchiseMappings, getFranchiseMappingsByFranchiseId } = require('../models/franchiseMappingModel.js');
const { saveFranchiseBranchFinanceCodes, getFranchiseBranchFinanceCodesByFranchiseId } = require('../models/franchiseBranchFinanceCodeModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

/**
 * Validates the authentication headers from Jasmin ERP
 */
const authenticateRequest = (req) => {
    const userid = req.headers['userid'];
    const securitycode = req.headers['securitycode'] || req.headers['Securitycode'] || req.headers['securityCode'];

    const expectedUserid = process.env.ERP_SYNC_USERID;
    const expectedSecuritycode = process.env.ERP_SYNC_SECURITYCODE;

    if (!expectedUserid || !expectedSecuritycode) {
        console.error('[SYNC] Sync configuration missing in .env');
        return false;
    }

    return (userid === expectedUserid && securitycode === expectedSecuritycode);
};

/**
 * Resolves the branchId parameter to a local franchise ID
 */
const resolveFranchiseId = async (branchId) => {
    // 1. Look up in branch-franchise mappings
    const [mappingRows] = await db.execute(
        'SELECT franchise_id FROM branch_franchise_mappings WHERE branch_code = ?',
        [branchId]
    );

    if (mappingRows.length > 0) {
        return mappingRows[0].franchise_id;
    }

    // 2. If branchId is numeric, fall back to checking if it is a franchise ID directly
    if (/^\d+$/.test(branchId)) {
        const [franchiseRows] = await db.execute(
            'SELECT id FROM in_process_franchises WHERE id = ?',
            [branchId]
        );
        if (franchiseRows.length > 0) {
            return parseInt(branchId, 10);
        }
    }

    return null;
};

/**
 * Gets a default user ID to associate with database entries
 */
const getDefaultUserId = async () => {
    try {
        const [rows] = await db.execute(
            "SELECT id FROM users WHERE role IN ('admin', 'super admin', 'user') ORDER BY id ASC LIMIT 1"
        );
        return rows.length > 0 ? rows[0].id : 1;
    } catch (err) {
        console.error('[SYNC] Failed to fetch default user ID, defaulting to 1:', err.message);
        return 1;
    }
};

/**
 * Endpoint A: Sync Mappings from Jasmin ERP
 */
const syncMappingsController = async (req, res) => {
    try {
        // 1. Validate headers
        if (!authenticateRequest(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid sync credentials' });
        }

        const { branchId } = req.params;
        const relations = req.body.relations || req.body.mappings;

        // 2. Resolve franchise ID
        const franchiseId = await resolveFranchiseId(branchId);
        if (!franchiseId) {
            return res.status(404).json({
                success: false,
                message: `Franchise mapping not found for branch: ${branchId}`
            });
        }

        const mappingsData = Array.isArray(relations) ? relations : [];
        
        // Map brand_id/company_id from ERP schema to internal mobile_brand_id/bank_id format
        const formattedMappings = mappingsData.map(m => ({
            mobile_brand_id: m.brand_id,
            bank_id: m.company_id
        }));

        const submittedBy = await getDefaultUserId();
        const existing = await getFranchiseMappingsByFranchiseId(franchiseId);

        // 3. Save mappings directly using model (skips outgoing trigger since it goes straight to DB)
        await saveFranchiseMappings(franchiseId, formattedMappings, submittedBy);

        // 4. Log audit details
        await createAuditLog(
            submittedBy,
            'ERP System',
            req.headers['x-device-id'] || 'ERP-SYNC',
            'In Process Franchise Mapping',
            'updated',
            existing,
            formattedMappings,
            franchiseId
        );

        console.log(`[SYNC] Mappings sync from ERP succeeded for franchiseId: ${franchiseId}`);

        res.status(200).json({
            success: true,
            message: 'Brand-finance mappings synchronized successfully.'
        });
    } catch (error) {
        console.error('[SYNC] Error syncing mappings from ERP:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error during mappings synchronization'
        });
    }
};

/**
 * Endpoint B: Sync Finance Codes from Jasmin ERP
 */
const syncFinanceCodesController = async (req, res) => {
    try {
        // 1. Validate headers
        if (!authenticateRequest(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid sync credentials' });
        }

        const { branchId } = req.params;
        const { brands, machines, companies, details } = req.body;

        // 2. Resolve franchise ID
        const franchiseId = await resolveFranchiseId(branchId);
        if (!franchiseId) {
            return res.status(404).json({
                success: false,
                message: `Franchise mapping not found for branch: ${branchId}`
            });
        }

        const submittedBy = await getDefaultUserId();
        const existing = await getFranchiseBranchFinanceCodesByFranchiseId(franchiseId);

        // 3. Save finance codes directly using model (skips outgoing sync)
        await saveFranchiseBranchFinanceCodes(
            franchiseId, 
            { 
                brands: brands || [], 
                machines: machines || [], 
                companies: companies || [],
                details: details || {}
            }, 
            submittedBy
        );

        // 4. Log audit details
        await createAuditLog(
            submittedBy,
            'ERP System',
            req.headers['x-device-id'] || 'ERP-SYNC',
            'In Process Franchise Branch Finance Code',
            'updated',
            existing,
            { brands, machines, companies, details },
            franchiseId
        );

        console.log(`[SYNC] Finance codes sync from ERP succeeded for franchiseId: ${franchiseId}`);

        res.status(200).json({
            success: true,
            message: 'Franchise branch finance codes synchronized successfully.'
        });
    } catch (error) {
        console.error('[SYNC] Error syncing finance codes from ERP:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error during finance codes synchronization'
        });
    }
};

module.exports = {
    syncMappingsController,
    syncFinanceCodesController
};

