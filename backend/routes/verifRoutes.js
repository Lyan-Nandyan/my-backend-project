const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middleware/verifyToken");

// Route untuk mendapatkan informasi pengguna setelah token diverifikasi
router.get("/userinfo", verifyToken, (req, res) => {
  // Mengirimkan ID pengguna dari token yang sudah diverifikasi
  res.status(200).json({ userId: req.userId });
});

module.exports = router;