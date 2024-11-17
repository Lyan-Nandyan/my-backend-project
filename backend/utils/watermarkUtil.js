const Jimp = require("jimp");

// Fungsi untuk menambahkan watermark (menggunakan LSB)
const addWatermark = async (imagePath, watermarkText) => {
  try {
    const image = await Jimp.read(imagePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Tambahkan karakter penghentian di akhir teks watermark
    const watermarkBuffer = Buffer.from(watermarkText + '\0', "utf-8");
    let watermarkIndex = 0;
    let bitIndex = 0; // Penanda posisi bit dalam satu byte watermark

    image.scan(0, 0, width, height, (x, y, idx) => {
      if (watermarkIndex < watermarkBuffer.length) {
        const byte = watermarkBuffer[watermarkIndex];
        const bit = (byte >> (7 - bitIndex)) & 1; // Ambil bit dari paling signifikan ke LSB

        // Update LSB dari warna merah piksel
        const pixel = image.getPixelColor(x, y);
        const red = (pixel >> 24) & 0xff;
        const newRed = (red & 0xfe) | bit;

        image.setPixelColor(
          (newRed << 24) |
            ((pixel >> 16) & 0xff00) |
            ((pixel >> 8) & 0xff) |
            (pixel & 0xff),
          x,
          y
        );

        // Update indeks bit dan byte
        bitIndex++;
        if (bitIndex === 8) {
          bitIndex = 0;
          watermarkIndex++;
        }
      }
    });

    const watermarkedImagePath = `uploads/watermarked_image_${Date.now()}.png`;
    await image.writeAsync(watermarkedImagePath);
    return watermarkedImagePath;
  } catch (error) {
    console.error("Error in watermarking process:", error);
    throw new Error("Failed to add watermark");
  }
};

// Fungsi untuk mengekstrak watermark dari gambar (menggunakan LSB)
const extractWatermark = async (imagePath) => {
  try {
    const image = await Jimp.read(imagePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    let extractedBits = [];
    let byte = 0;
    let bitCount = 0;

    image.scan(0, 0, width, height, (x, y, idx) => {
      const pixel = image.getPixelColor(x, y);
      const red = (pixel >> 24) & 0xff;

      // Ambil LSB dari warna merah
      const bit = red & 1;
      byte = (byte << 1) | bit;
      bitCount++;

      // Setiap 8 bit, tambahkan byte ke teks yang diekstrak
      if (bitCount === 8) {
        if (byte === 0) { // Jika menemukan karakter null ('\0'), hentikan ekstraksi
          return false; // Hentikan proses scan
        }
        extractedBits.push(byte);
        byte = 0;
        bitCount = 0;
      }
    });

    const extractedText = Buffer.from(extractedBits).toString("utf-8");
    return extractedText;
  } catch (error) {
    console.error("Error in watermark extraction process:", error);
    throw new Error("Failed to extract watermark");
  }
};

module.exports = { addWatermark, extractWatermark };
