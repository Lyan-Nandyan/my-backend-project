const fs = require("fs");
const crypto = require("crypto");
require("dotenv").config();

// Kunci untuk AES-256 (32 byte) - Pastikan ini sama untuk enkripsi dan dekripsi
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Pastikan menggunakan kunci yang sama saat enkripsi/dekripsi
const ivLength = 16; // AES-256-CBC membutuhkan IV 16-byte

// Fungsi untuk enkripsi file
const encryptFile = (filePath) => {
  const iv = crypto.randomBytes(ivLength); // Buat IV baru
  const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);
  const input = fs.createReadStream(filePath);
  const encryptedFilePath = filePath + ".enc";
  const output = fs.createWriteStream(encryptedFilePath);

  return new Promise((resolve, reject) => {
    const encryptedStream = input.pipe(cipher).pipe(output);

    encryptedStream.on("finish", () => {
      // Prepend the IV to the encrypted data
      const finalEncryptedData = Buffer.concat([
        iv,
        fs.readFileSync(encryptedFilePath),
      ]);
      fs.writeFileSync(encryptedFilePath, finalEncryptedData); // Simpan file dengan IV di-prepend
      resolve(encryptedFilePath);
    });

    encryptedStream.on("error", (err) => {
      reject(err);
    });
  });
};

// Fungsi untuk dekripsi file
const decryptFile = (encryptedFilePath, outputFilePath) => {
  const encryptedData = fs.readFileSync(encryptedFilePath);
  const iv = encryptedData.slice(0, ivLength); // Ambil IV dari awal data
  const encryptedBuffer = encryptedData.slice(ivLength); // Sisanya adalah data terenkripsi

  const decipher = crypto.createDecipheriv("aes-256-cbc", encryptionKey, iv);
  const input = new stream.Readable();
  input.push(encryptedBuffer);
  input.push(null);

  const output = fs.createWriteStream(outputFilePath);

  return new Promise((resolve, reject) => {
    input.pipe(decipher).pipe(output);

    output.on("finish", () => {
      resolve(outputFilePath);
    });

    output.on("error", (err) => {
      reject(err);
    });
  });
};

module.exports = { encryptFile, decryptFile };
