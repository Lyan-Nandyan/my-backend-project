const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");

// Route untuk mendapatkan informasi pengguna setelah token diverifikasi
router.post("/check-auth", verifyToken, (req, res) => {
  // Jika sampai di sini, berarti token valid dan pengguna terotentikasi
  res.status(200).json({ isAuthenticated: true });
});

module.exports = router;
