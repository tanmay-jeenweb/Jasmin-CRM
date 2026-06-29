const {
    createTeamRole,
    getAllTeamRoles,
    updateTeamRole,
    deleteTeamRole,
    getTeamRoleById
} = require('../models/teamRoleModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addTeamRoleController = async (req, res) => {
    try {
        const { role, isRequired } = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!role || !role.trim()) {
            return res.status(400).json({ success: false, message: 'Role name is required' });
        }

        const requiredVal = isRequired === true || isRequired === 1 || isRequired === 'yes';

        const result = await createTeamRole(role.trim(), requiredVal, addedBy, deviceId);
        
        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Team Role Master',
            'created',
            null,
            {
                id: result.insertId,
                role: role.trim(),
                is_required: requiredVal ? 1 : 0,
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Team role added successfully',
            data: { id: result.insertId, role: role.trim(), is_required: requiredVal }
        });
    } catch (error) {
        console.error('Error adding team role:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Role name already exists' });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllTeamRolesController = async (req, res) => {
    try {
        const roles = await getAllTeamRoles();
        res.status(200).json({
            success: true,
            message: 'Team roles retrieved successfully',
            data: roles
        });
    } catch (error) {
        console.error('Error retrieving team roles:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateTeamRoleController = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, isRequired } = req.body;

        if (!role || !role.trim()) {
            return res.status(400).json({ success: false, message: 'Role name is required' });
        }

        const requiredVal = isRequired === true || isRequired === 1 || isRequired === 'yes';
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        const beforeData = await getTeamRoleById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Team role not found' });
        }

        await updateTeamRole(id, role.trim(), requiredVal);
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Team Role Master',
            'updated',
            beforeData,
            {
                ...beforeData,
                role: role.trim(),
                is_required: requiredVal ? 1 : 0
            }
        );

        res.status(200).json({ success: true, message: 'Team role updated successfully' });
    } catch (error) {
        console.error('Error updating team role:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Role name already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteTeamRoleController = async (req, res) => {
    try {
        const { id } = req.params;
        const beforeData = await getTeamRoleById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Team role not found' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        await deleteTeamRole(id);
        
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Team Role Master',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({ success: true, message: 'Team role deleted successfully' });
    } catch (error) {
        console.error('Error deleting team role:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    addTeamRoleController,
    getAllTeamRolesController,
    updateTeamRoleController,
    deleteTeamRoleController
};
