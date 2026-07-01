const {
    createInProcessFranchise,
    getAllInProcessFranchises,
    getAllCompletedFranchises,
    updateInProcessFranchise,
    deleteInProcessFranchise,
    getInProcessFranchiseById,
    convertToFranchise
} = require('../models/inProcessFranchiseModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');
const {
    upsertFindStore,
    getFindStoreByFranchiseId,
    approveFindStore,
    rejectFindStore,
    getAllFindStores
} = require('../models/findStoreModel.js');
const {
    getAgreementGstByFranchiseId,
    upsertAgreementGst
} = require('../models/agreementGstModel.js');
const {
    getDocPrepByFranchiseId,
    upsertDocPrep
} = require('../models/docPrepModel.js');
const {
    getStorePlanningByFranchiseId,
    upsertStorePlanning
} = require('../models/storePlanningModel.js');
const {
    getStoreAmbianceByFranchiseId,
    upsertStoreAmbiance
} = require('../models/storeAmbianceModel.js');
const {
    getFranchiseTeamByFranchiseId,
    saveFranchiseTeam
} = require('../models/franchiseTeamModel.js');
const {
    getFranchiseMarketingByFranchiseId,
    upsertFranchiseMarketing
} = require('../models/franchiseMarketingModel.js');
const {
    getFranchiseInstallationByFranchiseId,
    upsertFranchiseInstallation
} = require('../models/franchiseInstallationModel.js');
const {
    getFranchiseSwipeMachineByFranchiseId,
    upsertFranchiseSwipeMachine
} = require('../models/franchiseSwipeMachineModel.js');
const {
    getFranchiseTrainingByFranchiseId,
    saveFranchiseTraining
} = require('../models/franchiseTrainingModel.js');
const {
    getFranchiseDepositStockByFranchiseId,
    upsertFranchiseDepositStock,
    approveFranchiseDepositStock,
    rejectFranchiseDepositStock,
    getAllDepositStocks
} = require('../models/franchiseDepositStockModel.js');
const {
    getFranchiseMappingsByFranchiseId,
    saveFranchiseMappings
} = require('../models/franchiseMappingModel.js');
const {
    getFranchiseInsuranceByFranchiseId,
    upsertFranchiseInsurance
} = require('../models/franchiseInsuranceModel.js');

const addInProcessFranchiseController = async (req, res) => {
    try {
        const data = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Validation
        if (!data.partnerName || !data.partnerName.trim()) {
            return res.status(400).json({ success: false, message: 'Partner Name is required' });
        }
        if (!data.partnerMobile || !data.partnerMobile.trim()) {
            return res.status(400).json({ success: false, message: 'Partner Mobile is required' });
        }
        if (!data.partnerEmail || !data.partnerEmail.trim()) {
            return res.status(400).json({ success: false, message: 'Partner Email is required' });
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

        const result = await createInProcessFranchise(data, addedBy, deviceId);

        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise',
            'created',
            null,
            {
                id: result.insertId,
                partner_name: data.partnerName,
                partner_mobile: data.partnerMobile,
                store_name: data.storeName
            }
        );

        res.status(201).json({
            success: true,
            message: 'In Process Franchise created successfully',
            data: { id: result.insertId, ...data }
        });
    } catch (error) {
        console.error('Error adding in process franchise:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllInProcessFranchisesController = async (req, res) => {
    try {
        const franchises = await getAllInProcessFranchises();
        res.status(200).json({
            success: true,
            message: 'In Process Franchises retrieved successfully',
            data: franchises
        });
    } catch (error) {
        console.error('Error retrieving in process franchises:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateInProcessFranchiseController = async (req, res) => {
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
        if (!data.partnerEmail || !data.partnerEmail.trim()) {
            return res.status(400).json({ success: false, message: 'Partner Email is required' });
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

        const beforeData = await getInProcessFranchiseById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        await updateInProcessFranchise(id, data);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise',
            'updated',
            beforeData,
            { id, ...data }
        );

        res.status(200).json({
            success: true,
            message: 'In Process Franchise updated successfully'
        });
    } catch (error) {
        console.error('Error updating in process franchise:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deleteInProcessFranchiseController = async (req, res) => {
    try {
        const { id } = req.params;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const beforeData = await getInProcessFranchiseById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        await deleteInProcessFranchise(id);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({
            success: true,
            message: 'In Process Franchise deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting in process franchise:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getInProcessFranchiseByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
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
            message: 'In Process Franchise retrieved successfully',
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
        console.error('Error retrieving in process franchise by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const upsertFindStoreController = async (req, res) => {
    try {
        const { id } = req.params;
        const { storeLocation, storeMapLink, businessArea, clusterValue, processActiveValue } = req.body;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Check if franchise exists
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        // Validate text fields
        if (!storeLocation || !storeLocation.trim()) {
            return res.status(400).json({ success: false, message: 'Store Location is required' });
        }
        if (!storeMapLink || !storeMapLink.trim()) {
            return res.status(400).json({ success: false, message: 'Store Map Link is required' });
        }
        if (!businessArea || !businessArea.trim()) {
            return res.status(400).json({ success: false, message: 'Business Area is required' });
        }

        // Get files
        const storePhotoFiles = req.files && req.files['storePhoto'] ? req.files['storePhoto'] : [];
        const authorityCertificateFile = req.files && req.files['authorityCertificate'] ? req.files['authorityCertificate'][0] : null;

        const existing = await getFindStoreByFranchiseId(id);

        // Retrieve existing photos that were kept by the user, if provided
        let existingPhotos = [];
        if (req.body.existingPhotos) {
            try {
                existingPhotos = JSON.parse(req.body.existingPhotos);
                if (!Array.isArray(existingPhotos)) {
                    existingPhotos = [];
                }
            } catch (e) {
                existingPhotos = [];
            }
        } else if (existing && storePhotoFiles.length === 0) {
            // Fallback for older/other APIs not sending existingPhotos: keep what's in DB
            try {
                const parsed = JSON.parse(existing.store_photo);
                existingPhotos = Array.isArray(parsed) ? parsed : [existing.store_photo];
            } catch (e) {
                if (existing.store_photo) {
                    existingPhotos = [existing.store_photo];
                }
            }
        }

        const newPhotoNames = storePhotoFiles.map(file => file.filename);
        const allPhotos = [...existingPhotos, ...newPhotoNames];

        if (allPhotos.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one Store Photo is required' });
        }

        const storePhotoPath = JSON.stringify(allPhotos);
        let authorityCertificatePath = undefined;

        if (authorityCertificateFile) {
            authorityCertificatePath = authorityCertificateFile.filename;
        }

        const data = {
            inProcessFranchiseId: id,
            storeLocation: storeLocation.trim(),
            storeMapLink: storeMapLink.trim(),
            storePhoto: storePhotoPath,
            businessArea: businessArea.trim(),
            clusterValue: clusterValue ? clusterValue.trim() : null,
            processActiveValue: processActiveValue ? processActiveValue.trim() : null,
            authorityCertificate: authorityCertificatePath,
            submittedBy
        };

        const result = await upsertFindStore(data);

        await createAuditLog(
            submittedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Find Store',
            result.action,
            existing,
            data
        );

        res.status(200).json({
            success: true,
            message: `Find Store form successfully ${result.action === 'created' ? 'submitted' : 'updated'}.`,
            data: await getFindStoreByFranchiseId(id)
        });
    } catch (error) {
        console.error('Error upserting find store details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const approveFindStoreController = async (req, res) => {
    try {
        const { id } = req.params;
        const approvedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const existing = await getFindStoreByFranchiseId(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Find Store details not found' });
        }

        await approveFindStore(id, approvedBy);

        await createAuditLog(
            approvedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Find Store',
            'approved',
            existing,
            { ...existing, status: 'approved', approved_by: approvedBy }
        );

        res.status(200).json({
            success: true,
            message: 'Find Store form approved successfully'
        });
    } catch (error) {
        console.error('Error approving find store details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const rejectFindStoreController = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const rejectedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!reason || !reason.trim()) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        }

        const existing = await getFindStoreByFranchiseId(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Find Store details not found' });
        }

        await rejectFindStore(id, reason.trim(), rejectedBy);

        await createAuditLog(
            rejectedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Find Store',
            'rejected',
            existing,
            { ...existing, status: 'rejected', rejection_reason: reason.trim() }
        );

        res.status(200).json({
            success: true,
            message: 'Find Store form rejected successfully'
        });
    } catch (error) {
        console.error('Error rejecting find store details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllFindStoresController = async (req, res) => {
    try {
        const findStores = await getAllFindStores();
        res.status(200).json({
            success: true,
            message: 'Find Store submissions retrieved successfully',
            data: findStores
        });
    } catch (error) {
        console.error('Error retrieving all find store submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const saveAgreementGstController = async (req, res) => {
    try {
        const { id } = req.params;
        const { partnerDate, gstRegistrationDate, gstNumber } = req.body;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Check if franchise exists
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        // Parse documents array from body
        let parsedDocs = [];
        if (req.body.documents) {
            try {
                parsedDocs = JSON.parse(req.body.documents);
            } catch (e) {
                console.error("Error parsing documents JSON:", e);
                return res.status(400).json({ success: false, message: 'Invalid documents data format' });
            }
        }

        // Loop over the parsed documents and populate file paths
        const finalDocs = [];
        for (let i = 0; i < parsedDocs.length; i++) {
            const doc = parsedDocs[i];
            
            if (!doc.doc_type || !doc.doc_type.trim()) {
                return res.status(400).json({ success: false, message: 'Document type is required for all items' });
            }

            let documentPath = doc.document_path;

            // Check if there is a new uploaded file for this index
            const fileKey = `file_${i}`;
            const uploadedFile = req.files && req.files.find(f => f.fieldname === fileKey);
            if (uploadedFile) {
                documentPath = uploadedFile.filename;
            }

            // A document file is required. If we don't have documentPath, error out!
            if (!documentPath) {
                return res.status(400).json({ 
                    success: false, 
                    message: `File is required for document type: ${doc.doc_type}` 
                });
            }

            finalDocs.push({
                doc_type: doc.doc_type.trim(),
                document_path: documentPath,
                expiry_date: doc.expiry_date || null
            });
        }

        const existing = await getAgreementGstByFranchiseId(id);

        await upsertAgreementGst(id, partnerDate, gstRegistrationDate, gstNumber, submittedBy, finalDocs);

        // Fetch updated details
        const updated = await getAgreementGstByFranchiseId(id);

        // Create audit log
        await createAuditLog(
            submittedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Agreement & GST',
            existing ? 'updated' : 'created',
            existing,
            { partnerDate, gstRegistrationDate, gstNumber, documentsCount: finalDocs.length }
        );

        res.status(200).json({
            success: true,
            message: 'Agreement & GST details saved successfully.',
            data: updated
        });

    } catch (error) {
        console.error('Error saving Agreement & GST details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const saveDocPrepController = async (req, res) => {
    try {
        const { id } = req.params;
        const { dispatchDate, dispatchName, receiverDate, receiverName } = req.body;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Check if franchise exists
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        // Get files
        const dispatchFile = req.files && req.files.find(f => f.fieldname === 'dispatchFile');
        const receiverFile = req.files && req.files.find(f => f.fieldname === 'receiverFile');

        const existing = await getDocPrepByFranchiseId(id);

        let dispatchFilePath = undefined;
        let receiverFilePath = undefined;

        if (dispatchFile) {
            dispatchFilePath = dispatchFile.filename;
        }
        if (receiverFile) {
            receiverFilePath = receiverFile.filename;
        }

        const data = {
            dispatchDate: dispatchDate || null,
            dispatchName: dispatchName || null,
            dispatchFile: dispatchFilePath,
            receiverDate: receiverDate || null,
            receiverName: receiverName || null,
            receiverFile: receiverFilePath,
            submittedBy
        };

        await upsertDocPrep(id, data);

        const updated = await getDocPrepByFranchiseId(id);

        // Create audit log
        await createAuditLog(
            submittedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Document Preparation',
            existing ? 'updated' : 'created',
            existing,
            data
        );

        res.status(200).json({
            success: true,
            message: 'Document Preparation details saved successfully.',
            data: updated
        });
    } catch (error) {
        console.error('Error saving Document Preparation details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const saveStorePlanningController = async (req, res) => {
    try {
        const { id } = req.params;
        const { mainBoardSignSize } = req.body;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Check if franchise exists
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        // Get files
        const interiorFile = req.files && req.files.find(f => f.fieldname === 'interiorFile');
        const inshopBrandingFile = req.files && req.files.find(f => f.fieldname === 'inshopBrandingFile');
        const floorPlanFile = req.files && req.files.find(f => f.fieldname === 'floorPlanFile');
        const billingFormatFile = req.files && req.files.find(f => f.fieldname === 'billingFormatFile');

        const existing = await getStorePlanningByFranchiseId(id);

        let interiorFilePath = undefined;
        let inshopBrandingFilePath = undefined;
        let floorPlanFilePath = undefined;
        let billingFormatFilePath = undefined;

        if (interiorFile) {
            interiorFilePath = interiorFile.filename;
        }
        if (inshopBrandingFile) {
            inshopBrandingFilePath = inshopBrandingFile.filename;
        }
        if (floorPlanFile) {
            floorPlanFilePath = floorPlanFile.filename;
        }
        if (billingFormatFile) {
            billingFormatFilePath = billingFormatFile.filename;
        }

        const data = {
            mainBoardSignSize: mainBoardSignSize || null,
            interiorFile: interiorFilePath,
            inshopBrandingFile: inshopBrandingFilePath,
            floorPlanFile: floorPlanFilePath,
            billingFormatFile: billingFormatFilePath,
            submittedBy
        };

        await upsertStorePlanning(id, data);

        const updated = await getStorePlanningByFranchiseId(id);

        // Create audit log
        await createAuditLog(
            submittedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Store Planning',
            existing ? 'updated' : 'created',
            existing,
            data
        );

        res.status(200).json({
            success: true,
            message: 'Store Planning details saved successfully.',
            data: updated
        });
    } catch (error) {
        console.error('Error saving Store Planning details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const saveStoreAmbianceController = async (req, res) => {
    try {
        const { id } = req.params;
        const { remark } = req.body;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Check if franchise exists
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        // Get files
        const furnitureFixingFile = req.files && req.files.find(f => f.fieldname === 'furnitureFixingFile');
        const companyFurnitureFittingFile = req.files && req.files.find(f => f.fieldname === 'companyFurnitureFittingFile');
        const shineBoardFile = req.files && req.files.find(f => f.fieldname === 'shineBoardFile');
        const inShopBrandingFile = req.files && req.files.find(f => f.fieldname === 'inShopBrandingFile');
        const templeLocationFile = req.files && req.files.find(f => f.fieldname === 'templeLocationFile');
        const ambiancePhotoFile = req.files && req.files.find(f => f.fieldname === 'ambiancePhotoFile');

        const existing = await getStoreAmbianceByFranchiseId(id);

        let furnitureFixingFilePath = undefined;
        let companyFurnitureFittingFilePath = undefined;
        let shineBoardFilePath = undefined;
        let inShopBrandingFilePath = undefined;
        let templeLocationFilePath = undefined;
        let ambiancePhotoFilePath = undefined;

        if (furnitureFixingFile) furnitureFixingFilePath = furnitureFixingFile.filename;
        if (companyFurnitureFittingFile) companyFurnitureFittingFilePath = companyFurnitureFittingFile.filename;
        if (shineBoardFile) shineBoardFilePath = shineBoardFile.filename;
        if (inShopBrandingFile) inShopBrandingFilePath = inShopBrandingFile.filename;
        if (templeLocationFile) templeLocationFilePath = templeLocationFile.filename;
        if (ambiancePhotoFile) ambiancePhotoFilePath = ambiancePhotoFile.filename;

        const data = {
            furnitureFixingFile: furnitureFixingFilePath,
            companyFurnitureFittingFile: companyFurnitureFittingFilePath,
            shineBoardFile: shineBoardFilePath,
            inShopBrandingFile: inShopBrandingFilePath,
            templeLocationFile: templeLocationFilePath,
            ambiancePhotoFile: ambiancePhotoFilePath,
            remark: remark ? remark.trim() : null,
            submittedBy
        };

        await upsertStoreAmbiance(id, data);

        const updated = await getStoreAmbianceByFranchiseId(id);

        // Create audit log
        await createAuditLog(
            submittedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Store Ambiance',
            existing ? 'updated' : 'created',
            existing,
            data
        );

        res.status(200).json({
            success: true,
            message: 'Store Ambiance details saved successfully.',
            data: updated
        });
    } catch (error) {
        console.error('Error saving Store Ambiance details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const saveFranchiseTeamController = async (req, res) => {
    try {
        const { id } = req.params;
        const { roles } = req.body;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const beforeData = await getFranchiseTeamByFranchiseId(id);

        await saveFranchiseTeam(id, roles, submittedBy);

        const afterData = await getFranchiseTeamByFranchiseId(id);

        await createAuditLog(
            req.user.id,
            req.user.name || req.user.username || 'Unknown',
            deviceId,
            'In Process Franchise Team',
            beforeData && beforeData.some(r => r.is_selected) ? 'updated' : 'created',
            beforeData,
            afterData
        );

        res.status(200).json({
            success: true,
            message: 'Franchise Team saved successfully',
            data: afterData
        });
    } catch (error) {
        console.error('Error saving franchise team:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const saveFranchiseMarketingController = async (req, res) => {
    try {
        const { id } = req.params;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Check if franchise exists
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        // Get files
        const comingSoonPostFile = req.files && req.files.find(f => f.fieldname === 'comingSoonPost');
        const openingPhotoFile = req.files && req.files.find(f => f.fieldname === 'openingPhoto');
        const thankYouPostFile = req.files && req.files.find(f => f.fieldname === 'thankYouPost');

        const existing = await getFranchiseMarketingByFranchiseId(id);

        let comingSoonPostPath = undefined;
        let openingPhotoPath = undefined;
        let thankYouPostPath = undefined;

        if (comingSoonPostFile) comingSoonPostPath = comingSoonPostFile.filename;
        if (openingPhotoFile) openingPhotoPath = openingPhotoFile.filename;
        if (thankYouPostFile) thankYouPostPath = thankYouPostFile.filename;

        // Parse checkboxes
        const invitationCard = req.body.invitationCard === 'true' || req.body.invitationCard === '1';
        const visitingCard = req.body.visitingCard === 'true' || req.body.visitingCard === '1';
        const grandOpening = req.body.grandOpening === 'true' || req.body.grandOpening === '1';
        
        const offerPamphlet = req.body.offerPamphlet === 'true' || req.body.offerPamphlet === '1';
        const rickshawBanner = req.body.rickshawBanner === 'true' || req.body.rickshawBanner === '1';
        const hoarding = req.body.hoarding === 'true' || req.body.hoarding === '1';
        const newspaperAdd = req.body.newspaperAdd === 'true' || req.body.newspaperAdd === '1';
        const cinemaSlide = req.body.cinemaSlide === 'true' || req.body.cinemaSlide === '1';
        const reels = req.body.reels === 'true' || req.body.reels === '1';
        const fmRadio = req.body.fmRadio === 'true' || req.body.fmRadio === '1';
        const socialMediaPostBoosting = req.body.socialMediaPostBoosting === 'true' || req.body.socialMediaPostBoosting === '1';

        const data = {
            comingSoonPost: comingSoonPostPath,
            openingPhoto: openingPhotoPath,
            thankYouPost: thankYouPostPath,
            invitationCard,
            visitingCard,
            grandOpening,
            offerPamphlet,
            rickshawBanner,
            hoarding,
            newspaperAdd,
            cinemaSlide,
            reels,
            fmRadio,
            socialMediaPostBoosting,
            openingCityAddress: req.body.openingCityAddress ? req.body.openingCityAddress.trim() : null,
            googleMyBusinessLink: req.body.googleMyBusinessLink ? req.body.googleMyBusinessLink.trim() : null,
            facebookBusinessPageLink: req.body.facebookBusinessPageLink ? req.body.facebookBusinessPageLink.trim() : null,
            submittedBy
        };

        await upsertFranchiseMarketing(id, data);

        const updated = await getFranchiseMarketingByFranchiseId(id);

        // Create audit log
        await createAuditLog(
            submittedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Marketing',
            existing ? 'updated' : 'created',
            existing,
            data
        );

        res.status(200).json({
            success: true,
            message: 'Franchise Marketing details saved successfully.',
            data: updated
        });
    } catch (error) {
        console.error('Error saving Franchise Marketing details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const saveFranchiseInstallationController = async (req, res) => {
    try {
        const { id } = req.params;
        const { apx, firewallDevice, priceList, internetConnection, installationDate, remarks } = req.body;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Check if franchise exists
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        const existing = await getFranchiseInstallationByFranchiseId(id);

        const data = {
            apx: apx === true || apx === 'true' || apx === 1 || apx === '1',
            firewallDevice: firewallDevice === true || firewallDevice === 'true' || firewallDevice === 1 || firewallDevice === '1',
            priceList: priceList === true || priceList === 'true' || priceList === 1 || priceList === '1',
            internetConnection: internetConnection === true || internetConnection === 'true' || internetConnection === 1 || internetConnection === '1',
            installationDate: installationDate || null,
            remarks: remarks ? remarks.trim() : null,
            submittedBy
        };

        await upsertFranchiseInstallation(id, data);

        const updated = await getFranchiseInstallationByFranchiseId(id);

        // Create audit log
        await createAuditLog(
            submittedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Installation',
            existing ? 'updated' : 'created',
            existing,
            data
        );

        res.status(200).json({
            success: true,
            message: 'Franchise Installation details saved successfully.',
            data: updated
        });
    } catch (error) {
        console.error('Error saving Franchise Installation details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const saveFranchiseSwipeMachineController = async (req, res) => {
    try {
        const { id } = req.params;
        const { agreementPhotoReceiptDate, qrBharatPay, qrHdfc, brands } = req.body;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Check if franchise exists
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        const existing = await getFranchiseSwipeMachineByFranchiseId(id);

        const data = {
            agreementPhotoReceiptDate: agreementPhotoReceiptDate || null,
            qrBharatPay: qrBharatPay === true || qrBharatPay === 'true' || qrBharatPay === 1 || qrBharatPay === '1',
            qrHdfc: qrHdfc === true || qrHdfc === 'true' || qrHdfc === 1 || qrHdfc === '1',
            brands: Array.isArray(brands) ? brands : [],
            submittedBy
        };

        await upsertFranchiseSwipeMachine(id, data);

        const updated = await getFranchiseSwipeMachineByFranchiseId(id);

        // Create audit log
        await createAuditLog(
            submittedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Swipe Machine',
            existing ? 'updated' : 'created',
            existing,
            data
        );

        res.status(200).json({
            success: true,
            message: 'Swipe Machine details saved successfully.',
            data: updated
        });
    } catch (error) {
        console.error('Error saving Swipe Machine details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const saveFranchiseTrainingController = async (req, res) => {
    try {
        const { id } = req.params;
        const { modules } = req.body;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Check if franchise exists
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        const existing = await getFranchiseTrainingByFranchiseId(id);

        const modulesData = Array.isArray(modules) ? modules : [];

        await saveFranchiseTraining(id, modulesData, submittedBy);

        const updated = await getFranchiseTrainingByFranchiseId(id);

        // Create audit log
        await createAuditLog(
            submittedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Training',
            'updated',
            existing,
            modulesData
        );

        res.status(200).json({
            success: true,
            message: 'Franchise Training details saved successfully.',
            data: updated
        });
    } catch (error) {
        console.error('Error saving Franchise Training details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const saveFranchiseDepositStockController = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            poCreationDate,
            poNumber,
            expectedOpeningDate,
            chkStock,
            chkBillPaper,
            chkBag,
            chkBlueChit,
            chkStamp,
            chkSwipeMachine,
            chkQrCode,
            stockReceivedApx,
            stockReceivedApxDate,
            status
        } = req.body;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Check if franchise exists
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        const existing = await getFranchiseDepositStockByFranchiseId(id);

        const data = {
            poCreationDate: poCreationDate || null,
            poNumber: poNumber || null,
            expectedOpeningDate: expectedOpeningDate || null,
            chkStock: chkStock === true || chkStock === 'true' || chkStock === 1 || chkStock === '1',
            chkBillPaper: chkBillPaper === true || chkBillPaper === 'true' || chkBillPaper === 1 || chkBillPaper === '1',
            chkBag: chkBag === true || chkBag === 'true' || chkBag === 1 || chkBag === '1',
            chkBlueChit: chkBlueChit === true || chkBlueChit === 'true' || chkBlueChit === 1 || chkBlueChit === '1',
            chkStamp: chkStamp === true || chkStamp === 'true' || chkStamp === 1 || chkStamp === '1',
            chkSwipeMachine: chkSwipeMachine === true || chkSwipeMachine === 'true' || chkSwipeMachine === 1 || chkSwipeMachine === '1',
            chkQrCode: chkQrCode === true || chkQrCode === 'true' || chkQrCode === 1 || chkQrCode === '1',
            stockReceivedApx: stockReceivedApx === true || stockReceivedApx === 'true' || stockReceivedApx === 1 || stockReceivedApx === '1',
            stockReceivedApxDate: stockReceivedApxDate || null,
            status: status || null,
            submittedBy
        };

        await upsertFranchiseDepositStock(id, data);

        const updated = await getFranchiseDepositStockByFranchiseId(id);

        // Create audit log
        await createAuditLog(
            submittedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Deposit Stock',
            existing ? 'updated' : 'created',
            existing,
            data
        );

        res.status(200).json({
            success: true,
            message: 'Franchise Deposit & Stock details saved successfully.',
            data: updated
        });
    } catch (error) {
        console.error('Error saving Franchise Deposit & Stock details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllCompletedFranchisesController = async (req, res) => {
    try {
        const franchises = await getAllCompletedFranchises();
        res.status(200).json({
            success: true,
            message: 'Completed Franchises retrieved successfully',
            data: franchises
        });
    } catch (error) {
        console.error('Error fetching completed franchises:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getAllDepositStocksController = async (req, res) => {
    try {
        const submissions = await getAllDepositStocks();
        res.status(200).json({
            success: true,
            message: 'Deposit & Stock submissions retrieved successfully',
            data: submissions
        });
    } catch (error) {
        console.error('Error fetching Deposit & Stock submissions:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const approveFranchiseDepositStockController = async (req, res) => {
    try {
        const { id } = req.params;
        const approvedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const existing = await getFranchiseDepositStockByFranchiseId(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Deposit & Stock record not found' });
        }

        await approveFranchiseDepositStock(id, approvedBy);

        // Create audit log
        await createAuditLog(
            approvedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Deposit Stock Approval',
            'approved',
            existing,
            { ...existing, status: 'approved', approved_by: approvedBy }
        );

        res.status(200).json({
            success: true,
            message: 'Franchise Deposit & Stock details approved. Franchise moved to Franchise Module!'
        });
    } catch (error) {
        console.error('Error approving Franchise Deposit & Stock:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const rejectFranchiseDepositStockController = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const rejectedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!reason || !reason.trim()) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        }

        const existing = await getFranchiseDepositStockByFranchiseId(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Deposit & Stock record not found' });
        }

        await rejectFranchiseDepositStock(id, reason.trim(), rejectedBy);

        // Create audit log
        await createAuditLog(
            rejectedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Deposit Stock Rejection',
            'rejected',
            existing,
            { ...existing, status: 'rejected', rejection_reason: reason.trim() }
        );

        res.status(200).json({
            success: true,
            message: 'Franchise Deposit & Stock details rejected.'
        });
    } catch (error) {
        console.error('Error rejecting Franchise Deposit & Stock:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const saveFranchiseMappingController = async (req, res) => {
    try {
        const { id } = req.params;
        const { mappings } = req.body;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Check if franchise exists
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        const existing = await getFranchiseMappingsByFranchiseId(id);
        const mappingsData = Array.isArray(mappings) ? mappings : [];

        await saveFranchiseMappings(id, mappingsData, submittedBy);

        const updated = await getFranchiseMappingsByFranchiseId(id);

        // Create audit log
        await createAuditLog(
            submittedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Mapping',
            'updated',
            existing,
            mappingsData
        );

        res.status(200).json({
            success: true,
            message: 'Franchise Brand/Bank Mapping saved successfully.',
            data: updated
        });
    } catch (error) {
        console.error('Error saving Franchise Mapping details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const saveFranchiseInsuranceController = async (req, res) => {
    try {
        const { id } = req.params;
        const { gstLocation, startDate, endDate, amount } = req.body;
        const submittedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        // Check if franchise exists
        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        const imageFile = req.files && req.files.find(f => f.fieldname === 'imageFile');
        const existing = await getFranchiseInsuranceByFranchiseId(id);

        let imagePath = undefined;
        if (imageFile) {
            imagePath = imageFile.filename;
        }

        const data = {
            gstLocation: gstLocation || null,
            startDate: startDate || null,
            endDate: endDate || null,
            amount: amount ? parseFloat(amount) : null,
            imagePath,
            submittedBy
        };

        await upsertFranchiseInsurance(id, data);

        const updated = await getFranchiseInsuranceByFranchiseId(id);

        // Create audit log
        await createAuditLog(
            submittedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Insurance',
            existing ? 'updated' : 'created',
            existing,
            data
        );

        res.status(200).json({
            success: true,
            message: 'Insurance details saved successfully.',
            data: updated
        });
    } catch (error) {
        console.error('Error saving Insurance details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const convertToFranchiseController = async (req, res) => {
    try {
        const { id } = req.params;
        const { tentativeOpeningDate, finalOpeningDate } = req.body;
        const convertedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const franchise = await getInProcessFranchiseById(id);
        if (!franchise) {
            return res.status(404).json({ success: false, message: 'In Process Franchise not found' });
        }

        await convertToFranchise(id, tentativeOpeningDate, finalOpeningDate);

        await createAuditLog(
            convertedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'In Process Franchise Conversion',
            'converted',
            franchise,
            { ...franchise, status: 'completed', tentative_opening_date: tentativeOpeningDate, final_opening_date: finalOpeningDate }
        );

        res.status(200).json({
            success: true,
            message: 'In Process Franchise converted to Franchise successfully'
        });
    } catch (error) {
        console.error('Error converting in process franchise to completed:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    addInProcessFranchiseController,
    getAllInProcessFranchisesController,
    updateInProcessFranchiseController,
    deleteInProcessFranchiseController,
    getInProcessFranchiseByIdController,
    upsertFindStoreController,
    approveFindStoreController,
    rejectFindStoreController,
    getAllFindStoresController,
    saveAgreementGstController,
    saveDocPrepController,
    saveStorePlanningController,
    saveStoreAmbianceController,
    saveFranchiseTeamController,
    saveFranchiseMarketingController,
    saveFranchiseInstallationController,
    saveFranchiseSwipeMachineController,
    saveFranchiseTrainingController,
    saveFranchiseDepositStockController,
    saveFranchiseMappingController,
    saveFranchiseInsuranceController,
    getAllCompletedFranchisesController,
    getAllDepositStocksController,
    approveFranchiseDepositStockController,
    rejectFranchiseDepositStockController,
    convertToFranchiseController
};
