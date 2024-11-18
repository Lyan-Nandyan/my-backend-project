const fs = require("fs");
const crypto = require("crypto");
// const multer = require("multer");
const axios = require("axios");
const stream = require("stream");
require("dotenv").config(); // Load environment variables from .env file

// Kunci untuk AES-256 (32 byte) - Pastikan ini sama untuk enkripsi dan dekripsi
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // Pastikan menggunakan kunci yang sama saat enkripsi/dekripsi
const ivLength = 16; // AES-256-CBC membutuhkan IV 16-byte

// Encrypt File Function
const encryptFile = (filePath) => {
  const iv = crypto.randomBytes(ivLength); // Create a new IV
  const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);
  const input = fs.createReadStream(filePath);
  const encryptedFilePath = filePath;
  const output = fs.createWriteStream(encryptedFilePath);

  // Write IV + encrypted data to the file
  const ivBuffer = Buffer.from(iv);
  const encryptedDataStream = input.pipe(cipher).pipe(output);

  return new Promise((resolve, reject) => {
    encryptedDataStream.on("finish", () => {
      // Prepend the IV to the encrypted data
      const finalEncryptedData = Buffer.concat([
        ivBuffer,
        fs.readFileSync(encryptedFilePath),
      ]);
      fs.writeFileSync(encryptedFilePath, finalEncryptedData); // Save the file with the IV prepended
      resolve(encryptedFilePath);
    });

    encryptedDataStream.on("error", (err) => {
      reject(err);
    });
  });
};

const decryptFile = async (cloudinaryUrl) => {
  try {
    // Download the encrypted file from Cloudinary
    const response = await axios({
      url: cloudinaryUrl,
      method: "GET",
      responseType: "arraybuffer",
    });
    console.log("berrhasil download");

    const encryptedData = Buffer.from(response.data);
    const iv = encryptedData.slice(0, ivLength); // Extract the IV from the beginning
    const encryptedBuffer = encryptedData.slice(ivLength); // The rest is the encrypted data

    const decipher = crypto.createDecipheriv("aes-256-cbc", encryptionKey, iv);
    const decryptedFilePath = "uploads/decrypted_file.png";
    console.log("berrhasil membuat path dekripsi");

    // Create a readable stream from the encrypted buffer
    const encryptedStream = new stream.Readable();
    encryptedStream.push(encryptedBuffer);
    encryptedStream.push(null);

    // Create a writable stream for the output file
    const output = fs.createWriteStream(decryptedFilePath);
    encryptedStream.pipe(decipher).pipe(output);

    return new Promise((resolve, reject) => {
      output.on("finish", () => {
        resolve(decryptedFilePath);
      });

      output.on("error", (err) => {
        reject(err);
      });
    });
  } catch (error) {
    throw new Error("Failed to download and decrypt file");
  }
};

module.exports = { encryptFile, decryptFile };
