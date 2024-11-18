const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Ambil token dari cookie

  if (!token) {
    return res.status(401).json({ message: 'Access denied, please login' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Simpan ID pengguna yang terdekode
    next();
  } catch (error) {
    console.error('Invalid token:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = {verifyToken} ;