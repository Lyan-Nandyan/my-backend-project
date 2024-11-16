const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/chatController');

// Route untuk mengirim pesan
router.post('/send', sendMessage);
// Route untuk mendapatkan pesan
router.get('/:userId/messages', getMessages);

module.exports = router;
