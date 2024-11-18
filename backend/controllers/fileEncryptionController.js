const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const stream = require("stream");
const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // Load environment variables from .env file

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup multer to handle file uploads
const upload = multer({
  dest: "uploads/", // Temporary storage for uploaded files
}).single("file");

// Key for AES-256 (32 bytes)
const encryptionKey = crypto.randomBytes(32);
const ivLength = 16; // AES-256-CBC requires a 16-byte IV

// Encrypt File Function
const encryptFile = (filePath) => {
  const iv = crypto.randomBytes(ivLength); // Create a new IV
  const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);
  const input = fs.createReadStream(filePath);
  const encryptedFilePath = filePath + ".enc";
  const output = fs.createWriteStream(encryptedFilePath);

  // Write IV + encrypted data to the file
  const ivBuffer = Buffer.from(iv);
  const encryptedDataStream = input.pipe(cipher).pipe(output);

  return new Promise((resolve, reject) => {
    encryptedDataStream.on("finish", () => {
      const finalEncryptedData = fs.createWriteStream(encryptedFilePath);
      finalEncryptedData.write(ivBuffer);
      finalEncryptedData.write(fs.readFileSync(encryptedFilePath));
      resolve(encryptedFilePath);
    });

    encryptedDataStream.on("error", (err) => {
      reject(err);
    });
  });
};

// Upload to Cloudinary Function
const uploadToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { resource_type: "raw" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

// Function to handle encryption and upload to Cloudinary
const uploadAndEncryptFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: "Error uploading file" });
    }

    const file = req.file;
    const filePath = file.path;

    if (file.mimetype !== "image/png") {
      return res
        .status(400)
        .json({ error: "Only PNG files are supported for encryption" });
    }

    try {
      const encryptedFilePath = await encryptFile(filePath);
      const cloudinaryResult = await uploadToCloudinary(encryptedFilePath);

      // Delete local encrypted file after successful upload
      fs.unlinkSync(encryptedFilePath);

      return res.status(200).json({
        message: "File encrypted and uploaded to Cloudinary successfully",
        cloudinaryUrl: cloudinaryResult.secure_url,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
};

// Decrypt File Function
const decryptFile = (filePath) => {
  const encryptedData = fs.readFileSync(filePath);
  const iv = encryptedData.slice(0, ivLength);
  const encryptedBuffer = encryptedData.slice(ivLength);

  const decipher = crypto.createDecipheriv("aes-256-cbc", encryptionKey, iv);
  const decryptedFilePath = filePath + "_decrypted.png";
  const output = fs.createWriteStream(decryptedFilePath);

  const encryptedStream = new stream.Readable();
  encryptedStream.push(encryptedBuffer);
  encryptedStream.push(null);

  encryptedStream.pipe(decipher).pipe(output);

  return new Promise((resolve, reject) => {
    output.on("finish", () => {
      resolve(decryptedFilePath);
    });

    output.on("error", (err) => {
      reject(err);
    });
  });
};

// Function to handle decryption
const uploadAndDecryptFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: "Error uploading file" });
    }

    const file = req.file;
    const filePath = file.path;

    if (!file.originalname.endsWith(".enc")) {
      return res
        .status(400)
        .json({
          error: "Only encrypted files (.enc) are supported for decryption",
        });
    }

    try {
      const decryptedFilePath = await decryptFile(filePath);
      return res
        .status(200)
        .json({ message: "File decrypted successfully", decryptedFilePath });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
};

module.exports = { uploadAndEncryptFile, uploadAndDecryptFile };
