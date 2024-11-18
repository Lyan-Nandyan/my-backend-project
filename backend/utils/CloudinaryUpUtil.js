const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Fungsi untuk upload file ke Cloudinary
const uploadToCloudinary = async (filePath) => {
  try {
    // Menggunakan resource_type "raw" untuk file yang tidak berformat gambar
    const result = await cloudinary.uploader.upload(filePath, { resource_type: "raw" });

    if (!result || result.error) {
      throw new Error(result?.error?.message || "Cloudinary upload returned an empty response");
    }

    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

module.exports = { uploadToCloudinary };
