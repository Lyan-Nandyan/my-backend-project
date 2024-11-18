const Image = require("../models/Image");
const { superDecryptMessage } = require("../utils/superEnkripsi");

const loadImage = async (req, res) => {
  try {
    const senderId = req.userId; // ID pengguna dari middleware
    const images = await Image.findAll({ where: { senderId } });

    // Dekripsi URL gambar sebelum dikirim ke frontend
    const decryptedImages = images.map((image) => ({
      ...image.toJSON(),
      link: superDecryptMessage(image.link), // Dekripsi link gambar
    }));

    res.status(200).json({ images: decryptedImages });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

module.exports = {loadImage};