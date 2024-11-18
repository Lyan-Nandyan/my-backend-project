const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middleware/verifyToken");
const { loadImage } = require('../controllers/loadImageController');

// Route untuk mendapatkan informasi pengguna setelah token diverifikasi
router.get("/images", verifyToken, loadImage)

module.exports = router;