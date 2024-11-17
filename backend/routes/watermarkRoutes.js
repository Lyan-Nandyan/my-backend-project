const { verifyToken } = require("../middleware/verifyToken");
const express = require('express');
const router = express.Router();
const { uploadAndAddWatermark, extractWatermarkFromImage } = require('../controllers/watermarkController');

// Route untuk upload gambar dan menambahkan watermark
router.post('/upload', verifyToken, uploadAndAddWatermark);
router.post('/extract', verifyToken, extractWatermarkFromImage)
module.exports = router;