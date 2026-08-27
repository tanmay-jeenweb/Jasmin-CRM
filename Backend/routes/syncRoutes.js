const express = require('express');
const { syncMastersController } = require('../controllers/syncController.js');
const { verifyToken } = require('../middleware/authMiddleware.js');
const db = require('../config/db.js');

const router = express.Router();

const verifySyncPermission = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }
        
        // Admins and Super Admins bypass all checks
        if (req.user.role === 'admin' || req.user.role === 'super admin') {
            return next();
        }

        const { syncBrands = true, syncCompanies = true, syncMachines = true } = req.body || {};
        
        // Find user type permissions
        const [userRows] = await db.execute(
            "SELECT user_type_id FROM users WHERE id = ?",
            [req.user.id]
        );

        if (userRows.length === 0 || userRows[0].user_type_id === null) {
            return res.status(403).json({ success: false, message: "Access Denied." });
        }

        const userTypeId = userRows[0].user_type_id;

        // Determine which masters are requested for sync
        const checks = [];
        if (syncBrands) {
            checks.push('mobile_brand_master');
        }
        if (syncCompanies) {
            checks.push('bank_master');
        }
        if (syncMachines) {
            checks.push('finance_machine_master');
        }

        if (checks.length === 0) {
            checks.push('mobile_brand_master', 'bank_master', 'finance_machine_master');
        }

        const [permRows] = await db.execute(
            `SELECT master_name FROM user_type_permissions 
             WHERE user_type_id = ? AND can_write = 1 AND master_name IN (${checks.map(() => '?').join(', ')})`,
            [userTypeId, ...checks]
        );

        const authorizedMasters = permRows.map(row => row.master_name);
        const hasAllPermissions = checks.every(m => authorizedMasters.includes(m));

        if (hasAllPermissions) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "Access Denied. You do not have permission to sync the requested master data."
        });
    } catch (error) {
        console.error("Error in verifySyncPermission:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

router.post('/masters', verifyToken, verifySyncPermission, syncMastersController);

module.exports = router;
