const { verifyToken } = require("../middleware/verifyToken");
const express = require('express');
const router = express.Router();
const { uploadAndAddWatermark } = require('../controllers/watermarkController');

// Route untuk upload gambar dan menambahkan watermark
router.post('/upload', verifyToken, uploadAndAddWatermark);

module.exports = router;