const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

// Route untuk registrasi
router.post("/register", register);
// Route untuk Login
router.post('/login', login);

module.exports = router;
