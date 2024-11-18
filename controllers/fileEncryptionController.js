const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const axios = require("axios");
const stream = require("stream");
const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // Load environment variables from .env file

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Setup multer to handle file uploads
const upload = multer({
  dest: "uploads/", // Temporary storage for uploaded files
}).single("file");

// Key for AES-256 (32 bytes) - This key should be securely stored and reused for both encryption and decryption
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Ensure this key is same during encryption and decryption
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

// Decrypt File Function from Cloudinary URL
const decryptFileFromUrl = async (cloudinaryUrl) => {
  try {
    // Download the encrypted file from Cloudinary
    const response = await axios({
      url: cloudinaryUrl,
      method: "GET",
      responseType: "arraybuffer",
    });

    const encryptedData = Buffer.from(response.data);
    const iv = encryptedData.slice(0, ivLength); // Extract the IV from the beginning
    const encryptedBuffer = encryptedData.slice(ivLength); // The rest is the encrypted data

    const decipher = crypto.createDecipheriv("aes-256-cbc", encryptionKey, iv);
    const decryptedFilePath = "uploads/decrypted_file.png";

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

// Function to handle decryption from Cloudinary URL
const decryptFileFromCloudinary = async (req, res) => {
  const { cloudinaryUrl } = req.body;

  if (!cloudinaryUrl) {
    return res.status(400).json({ error: "Cloudinary URL is required" });
  }

  try {
    const decryptedFilePath = await decryptFileFromUrl(cloudinaryUrl);
    return res.status(200).json({
      message: "File decrypted successfully",
      decryptedFilePath,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadAndEncryptFile, decryptFileFromCloudinary };
