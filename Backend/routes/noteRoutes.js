const express = require("express");
const { addNoteController, getNotesController } = require("../controllers/noteController.js");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/add", verifyToken, verifyPermission('note_master', 'write'), addNoteController);
router.get("/inquiry/:inquiryId", verifyToken, verifyPermission('note_master', 'read'), getNotesController);

module.exports = router;
