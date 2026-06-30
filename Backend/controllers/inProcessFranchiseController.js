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
        res.status(200).json({
            success: true,
            message: 'In Process Franchise retrieved successfully',
            data: {
                ...franchise,
                findStore,
                agreementGst
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
    saveAgreementGstController
};
