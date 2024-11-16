const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/chatController");
const { verifyToken } = require("../middleware/verifyToken");
// Route untuk mengirim pesan
router.post("/send", verifyToken, sendMessage);
// Route untuk mendapatkan pesan
router.get("/:userId/messages", verifyToken, getMessages);

module.exports = router;
