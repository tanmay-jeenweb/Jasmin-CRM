const https = require('https');
const {
    syncBranches,
    getUnmappedFranchises,
    getUnmappedBranches,
    getAllMappings,
    getMappingById,
    createMapping,
    deleteMapping
} = require('../models/branchFranchiseMappingModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const fetchBranchesFromApi = () => {
    return new Promise((resolve, reject) => {
        const url = process.env.EXTERNAL_BRANCH_API_URL ;
        const userid = process.env.EXTERNAL_BRANCH_API_USERID || 'WebSite';
        const securitycode = process.env.EXTERNAL_BRANCH_API_SECURITY_CODE || '1151-8111-6444-4166';

        try {
            const parsedUrl = new URL(url);
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: {
                    'userid': userid,
                    'Securitycode': securitycode
                },
                rejectUnauthorized: false
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    if (res.statusCode !== 200) {
                        reject(new Error(`API responded with status code ${res.statusCode}`));
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (err) {
                        reject(new Error(`Failed to parse branch API JSON response: ${err.message}`));
                    }
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            req.end();
        } catch (err) {
            reject(err);
        }
    });
};

const syncBranchesController = async (req, res) => {
    try {
        const userId = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        
        const responseData = await fetchBranchesFromApi();
        if (responseData.StatusCode !== 0 && responseData.StatusCode !== '0') {
            return res.status(400).json({
                success: false,
                message: responseData.StatusMessage || 'External branch API returned failure status'
            });
        }

        const branchesList = responseData.Data;
        if (!branchesList || !Array.isArray(branchesList)) {
            return res.status(400).json({
                success: false,
                message: 'No branch data found in external API response'
            });
        }

        const syncResult = await syncBranches(branchesList);

        await createAuditLog(
            userId,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Branch Franchise Mapping Master',
            'synced',
            null,
            { syncResult }
        );

        res.status(200).json({
            success: true,
            message: 'Branches synced successfully',
            data: syncResult
        });
    } catch (error) {
        console.error('Error syncing branches:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error during branch sync'
        });
    }
};

const getUnmappedFranchisesController = async (req, res) => {
    try {
        const franchises = await getUnmappedFranchises();
        res.status(200).json({
            success: true,
            message: 'Unmapped franchises retrieved successfully',
            data: franchises
        });
    } catch (error) {
        console.error('Error retrieving unmapped franchises:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getUnmappedBranchesController = async (req, res) => {
    try {
        const branches = await getUnmappedBranches();
        res.status(200).json({
            success: true,
            message: 'Unmapped branches retrieved successfully',
            data: branches
        });
    } catch (error) {
        console.error('Error retrieving unmapped branches:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllMappingsController = async (req, res) => {
    try {
        const mappings = await getAllMappings();
        res.status(200).json({
            success: true,
            message: 'Mappings retrieved successfully',
            data: mappings
        });
    } catch (error) {
        console.error('Error retrieving mappings:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const createMappingController = async (req, res) => {
    try {
        const { franchiseId, branchCode } = req.body;
        const userId = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!franchiseId || !branchCode) {
            return res.status(400).json({
                success: false,
                message: 'Both franchiseId and branchCode are required'
            });
        }

        const result = await createMapping(franchiseId, branchCode, userId);

        await createAuditLog(
            userId,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Branch Franchise Mapping Master',
            'created',
            null,
            {
                id: result.insertId,
                franchise_id: franchiseId,
                branch_code: branchCode,
                submitted_by: userId
            },
            franchiseId
        );

        res.status(201).json({
            success: true,
            message: 'Franchise mapped to branch successfully',
            data: { id: result.insertId, franchiseId, branchCode }
        });
    } catch (error) {
        console.error('Error mapping branch to franchise:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'This franchise or branch is already mapped'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deleteMappingController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const mapping = await getMappingById(id);
        if (!mapping) {
            return res.status(404).json({
                success: false,
                message: 'Mapping record not found'
            });
        }

        await deleteMapping(id);

        await createAuditLog(
            userId,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Branch Franchise Mapping Master',
            'deleted',
            mapping,
            null,
            mapping.franchise_id
        );

        res.status(200).json({
            success: true,
            message: 'Franchise unmapped from branch successfully'
        });
    } catch (error) {
        console.error('Error deleting mapping:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    syncBranchesController,
    getUnmappedFranchisesController,
    getUnmappedBranchesController,
    getAllMappingsController,
    createMappingController,
    deleteMappingController
};
