const { verifyToken } = require("../middleware/verifyToken");
const express = require('express');
const router = express.Router();
const {Delete} = require("../controllers/deleteImgController");

router.post('/api/delete/:id', verifyToken, Delete);

module.exports = router;