const express = require("express");
const { addNoteController, getNotesController } = require("../controllers/noteController.js");
const { verifyToken } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/add", verifyToken, addNoteController);
router.get("/inquiry/:inquiryId", verifyToken, getNotesController);

module.exports = router;
