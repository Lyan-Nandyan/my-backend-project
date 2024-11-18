const Image = require("../models/Image"); // Model untuk database
const cloudinary = require("cloudinary").v2;
const { superDecryptMessage } = require("../utils/superEnkripsi"); // Import fungsi dekripsi

// Konfigurasi Cloudinary (pastikan konfigurasi Cloudinary ada di tempat yang benar)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Endpoint untuk menghapus gambar
const Delete = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari gambar berdasarkan ID di database
    const image = await Image.findByPk(id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Dekripsi link gambar
    const decryptedLink = superDecryptMessage(image.link);

    // Ekstrak public ID Cloudinary dari URL yang didekripsi
    const publicId = extractPublicIdFromUrl(decryptedLink);

    // Hapus gambar dari Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" }); // Menggunakan ID publik dari Cloudinary
    console.log(`public id:${publicId}`);

    // Hapus gambar dari database
    await image.destroy();

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
};

const extractPublicIdFromUrl = (url) => {
  // Misal format URL Cloudinary: https://res.cloudinary.com/<cloud_name>/raw/upload/v123456789/<public_id>.enc
  const urlParts = url.split("/");

  // Ambil bagian terakhir dari URL (misalnya: 'sj7h0tf5ujzjszbwywbe.enc')
  const publicId = urlParts[urlParts.length - 1];

  return publicId;
};

module.exports = { Delete };
