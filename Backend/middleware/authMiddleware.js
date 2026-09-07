const jwt = require("jsonwebtoken");
const db = require("../config/db.js");

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "No token provided. Unauthorized."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (!req.user.username || !req.user.name) {
            const [rows] = await db.execute(
                "SELECT name, username, role FROM users WHERE id = ?",
                [req.user.id]
            );

            if (rows.length) {
                req.user = {
                    ...req.user,
                    name: rows[0].name,
                    username: rows[0].username,
                    role: rows[0].role || req.user.role
                };
            }
        }

        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

const verifyAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "super admin" && req.user.role !== "office staff")) {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin only."
        });
    }
    next();
};

const verifyPermission = (masterName, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized. No user information."
                });
            }

            // Admins and Super Admins bypass all permission checks
            if (req.user.role === "admin" || req.user.role === "super admin") {
                return next();
            }

            const userId = req.user.id;

            // Get user's user_type_id
            const [userRows] = await db.execute(
                "SELECT user_type_id FROM users WHERE id = ?",
                [userId]
            );

            if (userRows.length === 0 || userRows[0].user_type_id === null) {
                return res.status(403).json({
                    success: false,
                    message: `Access Denied. You do not have permission for ${masterName} (${action}).`
                });
            }

            const userTypeId = userRows[0].user_type_id;

            const masters = Array.isArray(masterName) ? masterName : [masterName];
            const actions = Array.isArray(action) ? action : [action];

            const actionColumns = {
                read: "can_read",
                write: "can_write",
                update: "can_update",
                delete: "can_delete"
            };

            const columns = actions.map(act => actionColumns[act]).filter(Boolean);
            if (columns.length === 0) {
                return res.status(500).json({
                    success: false,
                    message: "Invalid permission action."
                });
            }

            const masterPlaceholders = masters.map(() => '?').join(', ');
            const orClause = columns.map(c => `${c} = 1`).join(" OR ");

            const query = `
                SELECT 1 
                FROM user_type_permissions 
                WHERE user_type_id = ? AND master_name IN (${masterPlaceholders}) AND (${orClause})
            `;
            const [permRows] = await db.execute(query, [userTypeId, ...masters]);

            if (permRows.length > 0) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: `Access Denied. Insufficient permissions for ${masters.join('/')} (${actions.join('/')}).`
            });

        } catch (error) {
            console.error("Error in verifyPermission middleware:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error during permission verification."
            });
        }
    };
};
const verifyFindStoreApproved = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Franchise ID is required."
            });
        }

        const [rows] = await db.execute(
            "SELECT status FROM in_process_franchise_find_stores WHERE in_process_franchise_id = ?",
            [id]
        );

        if (rows.length === 0 || rows[0].status !== "approved") {
            return res.status(403).json({
                success: false,
                message: "Access Denied. Find Store details must be approved first."
            });
        }

        next();
    } catch (error) {
        console.error("Error in verifyFindStoreApproved middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during permission check."
        });
    }
};

const verifyReportPermission = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. No user information."
            });
        }

        // Admin/Super Admin bypass all permission checks
        if (req.user.role === "admin" || req.user.role === "super admin") {
            return next();
        }

        const userId = req.user.id;

        // Get user's user_type_id
        const [userRows] = await db.execute(
            "SELECT user_type_id FROM users WHERE id = ?",
            [userId]
        );

        if (userRows.length === 0 || userRows[0].user_type_id === null) {
            return res.status(403).json({
                success: false,
                message: "Access Denied. You do not have report permissions."
            });
        }

        const userTypeId = userRows[0].user_type_id;

        // Check if they have read permission on activity_report or closed_inquiry_report
        const query = `
            SELECT master_name, can_read AS permitted 
            FROM user_type_permissions 
            WHERE user_type_id = ? AND master_name IN ('activity_report', 'closed_inquiry_report')
        `;
        const [permRows] = await db.execute(query, [userTypeId]);
        const hasAnyPerm = permRows.some(row => row.permitted === 1);

        if (hasAnyPerm) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "Access Denied. You do not have permission to view reports."
        });
    } catch (error) {
        console.error("verifyReportPermission error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error verifying report permissions."
        });
    }
};

module.exports = { verifyToken, verifyAdmin, verifyPermission, verifyFindStoreApproved, verifyReportPermission };
