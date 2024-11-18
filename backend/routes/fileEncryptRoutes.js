const { verifyToken } = require("../middleware/verifyToken");
const express = require('express');
const router = express.Router();
const {uploadAndEncryptFile, decryptFileFromCloudinary} = require("../controllers/fileEncryptionController");

// Route untuk upload gambar dan menambahkan watermark
router.post('/encrypt', verifyToken, uploadAndEncryptFile);
router.post('/decrypt', verifyToken, decryptFileFromCloudinary)
module.exports = router;