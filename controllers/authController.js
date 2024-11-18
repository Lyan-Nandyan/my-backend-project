const bcrypt = require("bcrypt");
const CryptoJS = require("crypto-js");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {
  superEncryptMessage,
  superDecryptMessage,
} = require("../utils/superEnkripsi");
require("dotenv").config();

const saltRounds = 10;
// const encryptionKey = process.env.AES_SECRET_KEY; // Ganti dengan kunci rahasia Anda

// // Fungsi untuk mengenkripsi username
// const encryptUsername = (username) => {
//   return CryptoJS.AES.encrypt(username, encryptionKey).toString();
// };

// // Fungsi untuk mendekripsi username
// const decryptUsername = (encryptedUsername) => {
//   const bytes = CryptoJS.AES.decrypt(encryptedUsername, encryptionKey);
//   return bytes.toString(CryptoJS.enc.Utf8);
// };

// Fungsi untuk registrasi pengguna
exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cek apakah username sudah ada
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Enkripsi username sebelum menyimpan
    const encryptedUsername = superEncryptMessage(username);

    // Simpan pengguna baru ke database
    const newUser = await User.create({
      username: encryptedUsername,
      password: hashedPassword,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Fungsi untuk login pengguna
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cari pengguna berdasarkan username terenkripsi
    const users = await User.findAll();
    const foundUser = users.find(
      (user) => superDecryptMessage(user.username) === username
    );

    if (!foundUser) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Buat token JWT
    const token = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Atur masa berlaku token sesuai kebutuhan
    });

    // Kirim token sebagai cookie yang aman
    res.cookie("token", token, {
      httpOnly: true, // Cookie tidak dapat diakses oleh JavaScript
      secure: process.env.NODE_ENV === "production", // Hanya dikirim melalui HTTPS jika di production
      sameSite: "None",
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
};
