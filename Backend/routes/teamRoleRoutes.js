const express = require('express');
const {
    addTeamRoleController,
    getAllTeamRolesController,
    updateTeamRoleController,
    deleteTeamRoleController
} = require('../controllers/teamRoleController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('team_role_master', 'write'), addTeamRoleController);
router.get('/all', verifyToken, verifyPermission('team_role_master', 'read'), getAllTeamRolesController);
router.put('/update/:id', verifyToken, verifyPermission('team_role_master', 'update'), updateTeamRoleController);
router.delete('/delete/:id', verifyToken, verifyPermission('team_role_master', 'delete'), deleteTeamRoleController);

module.exports = router;
