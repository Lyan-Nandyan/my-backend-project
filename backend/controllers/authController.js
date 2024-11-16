const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const { User } = require('../models');

const saltRounds = 10;
const encryptionKey = 'your-secret-key'; // Ganti dengan kunci rahasia Anda

// Fungsi untuk mengenkripsi username
const encryptUsername = (username) => {
  return CryptoJS.AES.encrypt(username, encryptionKey).toString();
};

// Fungsi untuk registrasi pengguna
exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cek apakah username sudah ada
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Enkripsi username sebelum menyimpan
    const encryptedUsername = encryptUsername(username);

    // Simpan pengguna baru ke database
    const newUser = await User.create({
      username: encryptedUsername,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
};