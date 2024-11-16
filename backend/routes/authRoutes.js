const express = require("express");
const router = express.Router();
const { register } = require("../controllers/authController");

// Route untuk registrasi
router.post("/register", register);

module.exports = router;
