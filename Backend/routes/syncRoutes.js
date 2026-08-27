const express = require('express');
const { syncMastersController } = require('../controllers/syncController.js');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/masters', verifyToken, verifyAdmin, syncMastersController);

module.exports = router;
