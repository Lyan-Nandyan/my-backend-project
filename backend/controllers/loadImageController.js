const Image = require("../models/Image");
const { superDecryptMessage } = require("../utils/superEnkripsi");
const { decryptFile, deleteDecryptedFile } = require("../utils/fileEncryptionUtil");
const fs = require("fs");

const loadImage = async (req, res) => {
  try {
    const senderId = req.userId; // ID pengguna dari middleware
    const images = await Image.findAll({ where: { senderId } });

    // Dekripsi URL gambar sebelum dikirim ke frontend
    const decryptedImages = await Promise.all(
      images.map(async (image) => {
        const decryptedUrl = superDecryptMessage(image.link);

        // Dekripsi file dari URL terenkripsi
        const decryptedFilePath = await decryptFile(decryptedUrl);

        // Baca file terdekripsi dan konversi ke base64 agar bisa dikirim ke frontend
        const fileData = fs.readFileSync(decryptedFilePath);
        const base64Image = `data:image/png;base64,${fileData.toString("base64")}`;

        deleteDecryptedFile(decryptedFilePath);
        return {
          id: image.id,
          status: image.status,
          createdAt: image.createdAt,
          base64Image,
        };
      })
    );

    res.status(200).json({ images: decryptedImages });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

module.exports = { loadImage };
