const { addWatermark, extractWatermark } = require("../utils/watermarkUtil");
const { uploadToCloudinary } = require("../utils/CloudinaryUpUtil");
const { superEncryptMessage, superDecryptMessage } = require("../utils/superEnkripsi");
const { encryptFile, decryptFile } = require("../utils/fileEncryptionUtil");
const { deleteFile } = require("../utils/fileUtil");
const Image = require("../models/Image");
const multer = require("multer");

// Setup multer untuk menerima file upload, hanya gambar yang diterima
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    // Memastikan hanya gambar yang dapat diupload
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File harus berupa gambar"), false);
    }
    cb(null, true);
  },
}).single("image");

// Fungsi utama untuk upload, menambahkan watermark, dan enkripsi file sebelum upload
const uploadAndAddWatermark = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ error: "Error uploading image" });
    }

    const { watermarkText } = req.body;
    const imagePath = req.file.path;
    const senderId = req.userId;

    try {
      // Proses watermark pada gambar
      const watermarkedImagePath = await addWatermark(imagePath, watermarkText);

      // Enkripsi file sebelum di-upload ke Cloudinary
      const encryptedFilePath = await encryptFile(watermarkedImagePath);

      // Upload file yang sudah dienkripsi ke Cloudinary
      const uploadedImageUrl = await uploadToCloudinary(encryptedFilePath);

      // Enkripsi URL gambar yang di-upload
      const encryptedImageUrl = superEncryptMessage(uploadedImageUrl);

      // Hapus file sementara setelah upload selesai
      deleteFile(imagePath); // Menghapus file asli
      deleteFile(watermarkedImagePath); // Menghapus file yang sudah diberi watermark
      deleteFile(encryptedFilePath); // Menghapus file yang sudah dienkripsi

      // Simpan informasi ke dalam database menggunakan model `Image`
      await Image.create({
        senderId: senderId,
        link: encryptedImageUrl,
        status: watermarkText === '' ? "noMark" : "Mark",
      });

      return res.status(200).json({
        message: "Image uploaded, watermarked, encrypted, and saved to database",
        imageUrl: superDecryptMessage(encryptedImageUrl),
      });
    } catch (error) {
      console.error("Error in watermarking or encryption process:", error);
      res.status(500).json({ error: "Failed to add watermark or encrypt image" });
    }
  });
};

// Fungsi untuk mengekstrak watermark dari gambar yang di-upload
const extractWatermarkFromImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ error: "Error uploading image" });
    }

    const imagePath = req.file.path;

    try {
      // Ekstrak watermark dari gambar
      const watermarkText = await extractWatermark(imagePath);

      // Hapus file gambar setelah proses ekstraksi
      deleteFile(imagePath);

      return res.status(200).json({
        message: "Watermark extracted successfully",
        watermarkText,
      });
    } catch (error) {
      console.error("Error in watermark extraction process:", error);
      res.status(500).json({ error: "Failed to extract watermark" });
    }
  });
};

module.exports = { uploadAndAddWatermark, extractWatermarkFromImage };
