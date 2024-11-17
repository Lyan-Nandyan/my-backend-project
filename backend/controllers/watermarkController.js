const cloudinary = require("cloudinary").v2;
const { addWatermark, extractWatermark } = require("../utils/watermarkUtil"); // Sesuaikan dengan fungsi watermarking Anda
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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

const uploadAndAddWatermark = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ error: "Error uploading image" });
    }

    const { watermarkText } = req.body; // Ambil teks watermark dari body
    const imagePath = req.file.path;

    try {
      // Proses watermark pada gambar
      const watermarkedImagePath = await addWatermark(imagePath, watermarkText);

      // Upload gambar yang sudah ada watermark-nya ke Cloudinary
      const result = await cloudinary.uploader.upload(watermarkedImagePath);

      if (result && result.error) {
        console.log("Cloudinary upload failed with error:", result.error);
        return res.status(500).json({
          error: `Cloudinary upload failed: ${result.error.message}`,
        });
      }

      if (!result) {
        console.log("Cloudinary upload returned an empty response");
        return res
          .status(500)
          .json({ error: "Cloudinary upload returned an empty response" });
      }

      const imageUrl = result.secure_url;
      console.log("Image uploaded successfully to Cloudinary:", imageUrl);

      // Hapus file sementara setelah upload selesai
      fs.unlinkSync(imagePath); // Menghapus file asli
      fs.unlinkSync(watermarkedImagePath); // Menghapus file yang sudah diberi watermark

      return res.status(200).json({
        message: "Image uploaded and watermarked",
        imageUrl,
      });
    } catch (error) {
      console.error("Error in watermarking process:", error);
      res.status(500).json({ error: "Failed to add watermark" });
    }
  });
};

// Endpoint untuk mengekstrak watermark dari gambar yang di-upload
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
      fs.unlinkSync(imagePath);

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
