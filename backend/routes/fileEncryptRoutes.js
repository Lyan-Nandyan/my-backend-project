const { verifyToken } = require("../middleware/verifyToken");
const express = require('express');
const router = express.Router();
const {uploadAndEncryptFile, uploadAndDecryptFile} = require("../controllers/fileEncryptionController");

// Route untuk upload gambar dan menambahkan watermark
router.post('/encrypt', verifyToken, uploadAndEncryptFile);
router.post('/decrypt', verifyToken, uploadAndDecryptFile)
module.exports = router;