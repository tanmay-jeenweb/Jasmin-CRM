const {
    getAllFranchises,
    getFranchiseById,
    updateFranchise,
    deleteFranchise
} = require('../models/franchiseModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');
const { getFindStoreByFranchiseId } = require('../models/findStoreModel.js');
const { getAgreementGstByFranchiseId } = require('../models/agreementGstModel.js');
const { getDocPrepByFranchiseId } = require('../models/docPrepModel.js');
const { getStorePlanningByFranchiseId } = require('../models/storePlanningModel.js');
const { getStoreAmbianceByFranchiseId } = require('../models/storeAmbianceModel.js');
const { getFranchiseTeamByFranchiseId } = require('../models/franchiseTeamModel.js');
const { getFranchiseMarketingByFranchiseId } = require('../models/franchiseMarketingModel.js');
const { getFranchiseInstallationByFranchiseId } = require('../models/franchiseInstallationModel.js');
const { getFranchiseSwipeMachineByFranchiseId } = require('../models/franchiseSwipeMachineModel.js');
const { getFranchiseTrainingByFranchiseId } = require('../models/franchiseTrainingModel.js');
const { getFranchiseDepositStockByFranchiseId } = require('../models/franchiseDepositStockModel.js');
const { getFranchiseMappingsByFranchiseId } = require('../models/franchiseMappingModel.js');
const { getFranchiseInsuranceByFranchiseId } = require('../models/franchiseInsuranceModel.js');

const getAllFranchisesController = async (req, res) => {
    try {
        const franchises = await getAllFranchises();
        res.status(200).json({
            success: true,
            message: 'Franchises retrieved successfully',
            data: franchises
        });
    } catch (error) {
        console.error('Error retrieving franchises:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getFranchiseByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const franchise = await getFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'Franchise not found' });
        }
        const findStore = await getFindStoreByFranchiseId(id);
        const isApproved = findStore && findStore.status === 'approved';

        const agreementGst = isApproved ? await getAgreementGstByFranchiseId(id) : null;
        const docPrep = isApproved ? await getDocPrepByFranchiseId(id) : null;
        const storePlanning = isApproved ? await getStorePlanningByFranchiseId(id) : null;
        const storeAmbiance = isApproved ? await getStoreAmbianceByFranchiseId(id) : null;
        const franchiseTeam = isApproved ? await getFranchiseTeamByFranchiseId(id) : [];
        const franchiseMarketing = isApproved ? await getFranchiseMarketingByFranchiseId(id) : null;
        const franchiseInstallation = isApproved ? await getFranchiseInstallationByFranchiseId(id) : null;
        const franchiseSwipeMachine = isApproved ? await getFranchiseSwipeMachineByFranchiseId(id) : null;
        const franchiseTraining = isApproved ? await getFranchiseTrainingByFranchiseId(id) : [];
        const franchiseDepositStock = isApproved ? await getFranchiseDepositStockByFranchiseId(id) : null;
        const franchiseMapping = isApproved ? await getFranchiseMappingsByFranchiseId(id) : [];
        const franchiseInsurance = isApproved ? await getFranchiseInsuranceByFranchiseId(id) : null;

        res.status(200).json({
            success: true,
            message: 'Franchise retrieved successfully',
            data: {
                ...franchise,
                findStore,
                agreementGst,
                docPrep,
                storePlanning,
                storeAmbiance,
                franchiseTeam,
                franchiseMarketing,
                franchiseInstallation,
                franchiseSwipeMachine,
                franchiseTraining,
                franchiseDepositStock,
                franchiseMapping,
                franchiseInsurance
            }
        });
    } catch (error) {
        console.error('Error retrieving franchise by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateFranchiseController = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Validation
        if (!data.partnerName || !data.partnerName.trim()) {
            return res.status(400).json({ success: false, message: 'Partner Name is required' });
        }
        if (!data.partnerMobile || !data.partnerMobile.trim()) {
            return res.status(400).json({ success: false, message: 'Partner Mobile is required' });
        }
        if (!data.city || !data.city.trim()) {
            return res.status(400).json({ success: false, message: 'City is required' });
        }
        if (!data.district || !data.district.trim()) {
            return res.status(400).json({ success: false, message: 'District is required' });
        }
        if (!data.state || !data.state.trim()) {
            return res.status(400).json({ success: false, message: 'State is required' });
        }
        if (!data.bdmArea || !data.bdmArea.trim()) {
            return res.status(400).json({ success: false, message: 'BDM Area is required' });
        }
        if (!data.inquiryManagerId) {
            return res.status(400).json({ success: false, message: 'Inquiry Manager is required' });
        }
        if (!data.storeName) {
            return res.status(400).json({ success: false, message: 'Store Name is required' });
        }

        const beforeData = await getFranchiseById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Franchise not found' });
        }

        await updateFranchise(id, data);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Franchise',
            'updated',
            beforeData,
            { id, ...data }
        );

        res.status(200).json({
            success: true,
            message: 'Franchise updated successfully'
        });
    } catch (error) {
        console.error('Error updating franchise:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deleteFranchiseController = async (req, res) => {
    try {
        const { id } = req.params;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const beforeData = await getFranchiseById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Franchise not found' });
        }

        await deleteFranchise(id);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Franchise',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({
            success: true,
            message: 'Franchise deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting franchise:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllFranchisesController,
    getFranchiseByIdController,
    updateFranchiseController,
    deleteFranchiseController
};
