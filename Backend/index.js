require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const path = require("path");
const uploadConfig = require("./config/uploadConfig.js");
const { connectDB } = require("./config/db.js");

// Routes
const authRoutes = require("./routes/authRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const userTypeMasterRoutes = require("./routes/userTypeMasterRoutes.js");
const labelRoutes = require("./routes/labelRoutes.js");
const inquirySourceRoutes = require("./routes/inquirySourceRoutes.js");
const companyBrandRoutes = require("./routes/companyBrandRoutes.js");
const documentRoutes = require("./routes/documentRoutes.js");
const teamRoleRoutes = require("./routes/teamRoleRoutes.js");
const inquiryRoutes = require("./routes/inquiryRoutes.js");
const callLogRoutes = require("./routes/callLogRoutes.js");
const reminderRoutes = require("./routes/reminderRoutes.js");
const noteRoutes = require("./routes/noteRoutes.js");
const inProcessFranchiseRoutes = require("./routes/inProcessFranchiseRoutes.js");
const callOutcomeRoutes = require("./routes/callOutcomeRoutes.js");

// Model Initializations
const { initUserModel } = require("./models/userModel.js");
const { createUserTypesTable, createUserTypePermissionsTable } = require("./models/userTypeModel.js");
const { createAuditLogsTable } = require("./models/auditLogModel.js");
const { createUserDevicesTable } = require("./models/deviceModel.js");
const { createLabelsTable } = require("./models/labelModel.js");
const { createInquirySourcesTable } = require("./models/inquirySourceModel.js");
const { createCompanyBrandsTable } = require("./models/companyBrandModel.js");
const { createDocumentsTable } = require("./models/documentModel.js");
const { createTeamRolesTable } = require("./models/teamRoleModel.js");
const { createInquiriesTable } = require("./models/inquiryModel.js");
const { createCallLogsTable } = require("./models/callLogModel.js");
const { createRemindersTable } = require("./models/reminderModel.js");
const { createNotesTable } = require("./models/noteModel.js");
const { createInProcessFranchiseTable } = require("./models/inProcessFranchiseModel.js");
const { createFindStoreTable } = require("./models/findStoreModel.js");
const { createAgreementGstTables } = require("./models/agreementGstModel.js");
const { createDocPrepTable } = require("./models/docPrepModel.js");
const { createStorePlanningTable } = require("./models/storePlanningModel.js");
const { createStoreAmbianceTable } = require("./models/storeAmbianceModel.js");
const { createFranchiseTeamTable } = require("./models/franchiseTeamModel.js");
const { createFranchiseMarketingTable } = require("./models/franchiseMarketingModel.js");
const { createFranchiseInstallationTable } = require("./models/franchiseInstallationModel.js");
const { createFranchiseSwipeMachineTable } = require("./models/franchiseSwipeMachineModel.js");
const { createFranchiseTrainingTable } = require("./models/franchiseTrainingModel.js");
const { createFranchiseDepositStockTable } = require("./models/franchiseDepositStockModel.js");
const { createCallOutcomesTable } = require("./models/callOutcomeModel.js");


const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://erp.elcen.com",
    "http://erp.elcen.com",
    "https://www.erp.elcen.com",
    "http://www.erp.elcen.com",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-HTTP-Method-Override", "x-device-id", "device-id"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically if set to express
if (uploadConfig.serveMethod === "express") {
    console.log(`Serving uploaded files statically from: ${uploadConfig.uploadDir}`);
    app.use("/uploads", express.static(uploadConfig.uploadDir));
}

// HTTP Method Override middleware for environments that block PUT and DELETE requests
app.use((req, res, next) => {
    const methodOverride = req.headers['x-http-method-override'];
    if (req.method === 'POST' && methodOverride) {
        req.method = methodOverride.toUpperCase();
    }
    next();
});

app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/admin", "/admin"], adminRoutes);
app.use(["/api/usertypes", "/usertypes"], userTypeMasterRoutes);
app.use(["/api/labels", "/labels"], labelRoutes);
app.use(["/api/inquirysources", "/inquirysources"], inquirySourceRoutes);
app.use(["/api/companybrands", "/companybrands"], companyBrandRoutes);
app.use(["/api/documents", "/documents"], documentRoutes);
app.use(["/api/teamroles", "/teamroles"], teamRoleRoutes);
app.use(["/api/inquiries", "/inquiries"], inquiryRoutes);
app.use(["/api/call-logs", "/call-logs"], callLogRoutes);
app.use(["/api/reminders", "/reminders"], reminderRoutes);
app.use(["/api/notes", "/notes"], noteRoutes);
app.use(["/api/in-process-franchises", "/in-process-franchises"], inProcessFranchiseRoutes);
app.use(["/api/calloutcomes", "/calloutcomes"], callOutcomeRoutes);


// Global 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ success: false, message: "Something went wrong" });
});

const startServer = async () => {
    try {
        await connectDB();

        console.log("Initializing database tables...");
        // Initialize tables in correct dependency order
        await initUserModel();
        await createUserTypesTable();
        await createUserTypePermissionsTable();
        await createAuditLogsTable();
        await createUserDevicesTable();
        await createLabelsTable();
        await createInquirySourcesTable();
        await createCompanyBrandsTable();
        await createDocumentsTable();
        await createTeamRolesTable();
        await createInquiriesTable();
        await createCallLogsTable();
        await createRemindersTable();
        await createNotesTable();
        await createInProcessFranchiseTable();
        await createFindStoreTable();
        await createAgreementGstTables();
        await createDocPrepTable();
        await createStorePlanningTable();
        await createStoreAmbianceTable();
        await createFranchiseTeamTable();
        await createFranchiseMarketingTable();
        await createFranchiseInstallationTable();
        await createFranchiseSwipeMachineTable();
        await createFranchiseTrainingTable();
        await createFranchiseDepositStockTable();
        await createCallOutcomesTable();

        console.log("All database tables are initialized and ready.");

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server Running on Port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start application server:", error);
        process.exit(1);
    }
};

startServer();