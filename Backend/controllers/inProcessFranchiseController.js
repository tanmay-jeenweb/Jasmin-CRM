const {
    createInProcessFranchise,
    getAllInProcessFranchises,
    updateInProcessFranchise,
    deleteInProcessFranchise,
    getInProcessFranchiseById
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
        if (!data.tentativeOpeningDate) {
            return res.status(400).json({ success: false, message: 'Tentative Opening Date is required' });
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
        if (!data.tentativeOpeningDate) {
            return res.status(400).json({ success: false, message: 'Tentative Opening Date is required' });
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
        const agreementGst = await getAgreementGstByFranchiseId(id);
        const docPrep = await getDocPrepByFranchiseId(id);
        const storePlanning = await getStorePlanningByFranchiseId(id);
        const storeAmbiance = await getStoreAmbianceByFranchiseId(id);
        const franchiseTeam = await getFranchiseTeamByFranchiseId(id);
        const franchiseMarketing = await getFranchiseMarketingByFranchiseId(id);
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
                franchiseMarketing
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
        const storePhotoFile = req.files && req.files['storePhoto'] ? req.files['storePhoto'][0] : null;
        const authorityCertificateFile = req.files && req.files['authorityCertificate'] ? req.files['authorityCertificate'][0] : null;

        const existing = await getFindStoreByFranchiseId(id);

        let storePhotoPath = undefined;
        let authorityCertificatePath = undefined;

        if (storePhotoFile) {
            storePhotoPath = storePhotoFile.filename;
        } else if (!existing) {
            return res.status(400).json({ success: false, message: 'Store Photo is required' });
        }

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
    saveFranchiseMarketingController
};
