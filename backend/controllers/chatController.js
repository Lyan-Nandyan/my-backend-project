const CryptoJS = require("crypto-js");
const Message = require("../models/Message");
const { Op } = require("sequelize");
require("dotenv").config();

const encryptionKey = process.env.AES_SECRET_KEY;

// Fungsi untuk mengenkripsi username
const encryptAES = (message) => {
  return CryptoJS.AES.encrypt(message, encryptionKey).toString();
};

// Fungsi untuk mendekripsi username
const decryptAES = (encryptedMessage) => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Fungsi Caesar Cipher (Enkripsi Klasik)
const caesarCipher = (text, shift) => {
  return text
    .split("") // Pisahkan teks menjadi karakter per karakter
    .map((char) => {
      // Jika karakter adalah huruf kecil
      if (char.match(/[a-z]/)) {
        const code = char.charCodeAt(0);
        let newCode = code + shift;

        // Jika melebihi 'z', kembali ke 'a'
        if (newCode > 122) newCode -= 26;
        // Jika kurang dari 'a', kembali ke 'z'
        if (newCode < 97) newCode += 26;

        return String.fromCharCode(newCode);
      }
      // Jika karakter adalah huruf kapital
      else if (char.match(/[A-Z]/)) {
        const code = char.charCodeAt(0);
        let newCode = code + shift;

        // Jika melebihi 'Z', kembali ke 'A'
        if (newCode > 90) newCode -= 26;
        // Jika kurang dari 'A', kembali ke 'Z'
        if (newCode < 65) newCode += 26;

        return String.fromCharCode(newCode);
      }
      // Untuk karakter selain huruf, biarkan apa adanya
      return char;
    })
    .join(""); // Gabungkan kembali menjadi string
};

// Fungsi untuk mengenkripsi pesan (Super Encryption)
const superEncryptMessage = (message, caesarShift = 3) => {
  const encryptedWithAES = encryptAES(message, encryptionKey); // Enkripsi dengan AES
  const encryptedWithCaesar = caesarCipher(encryptedWithAES, caesarShift); // Enkripsi dengan Caesar
  return encryptedWithCaesar;
};

const superDecryptMessage = (message, caesarShift = 3) => {
  // Dekripsi dengan Caesar
  const decryptedWithCaesar = caesarCipher(message, -caesarShift);
  // Dekripsi dengan AES
  const originalText = decryptAES(decryptedWithCaesar, encryptionKey);
  return originalText;
};

// Fungsi untuk mendekripsi pesan
const decryptMessage = (encryptedMessage) => {
  try {
    const originalText = superDecryptMessage(encryptedMessage);
    if (!originalText) {
      throw new Error("Failed to decrypt the message");
    }
    return originalText;
  } catch (error) {
    console.error("Decryption error:", error);
    return "Decryption error";
  }
};

// Fungsi untuk mengirim pesan
const sendMessage = async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    // Enkripsi pesan menggunakan super enkripsi
    const encryptedMessage = superEncryptMessage(message);

    // Simpan pesan ke database
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: encryptedMessage,
    });

    res
      .status(200)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error sending message:", error); // Log error untuk debugging
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Fungsi untuk menerima pesan
const getMessages = async (req, res) => {
  const { userId } = req.params;

  try {
    // Ambil semua pesan yang dikirim atau diterima oleh user
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    // Cek apakah ada pesan
    if (!messages || messages.length === 0) {
      return res.status(200).json([]); // Kembalikan array kosong jika tidak ada pesan
    }

    // Dekripsi pesan yang diterima
    const decryptedMessages = messages.map((msg) => {
      try {
        const decryptedText = decryptMessage(msg.message);
        return { ...msg.toJSON(), message: decryptedText };
      } catch (decryptError) {
        console.error("Decryption error for message ID:", msg.id, decryptError);
        return { ...msg.toJSON(), message: "Failed to decrypt message" }; // Handle decryption failure
      }
    });

    res.status(200).json(decryptedMessages); // Kembalikan pesan yang telah didekripsi
  } catch (error) {
    console.error("Error fetching messages:", error); // Log error untuk debugging
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// const message = "Hello World!";
// const encryptedMessageCaesar = caesarCipher(message, 3); // Enkripsi dengan Caesar
// console.log("Encrypted with Caesar:", encryptedMessageCaesar);

// const decryptedMessageCaesar = caesarCipher(encryptedMessageCaesar, -3); // Dekripsi dengan Caesar
// console.log("Decrypted with Caesar:", decryptedMessageCaesar);

// // Enkripsi dengan AES
// const encryptedMessage = encryptAES("Hello World!");
// console.log("Encrypted with AES:", encryptedMessage);

// // Dekripsi dengan AES
// const decryptedMessage = decryptAES(encryptedMessage);
// console.log("Decrypted with AES:", decryptedMessage);

// // Enkripsi dengan AES
// const encryptedSuper = superEncryptMessage("Hello World!");
// console.log("Encrypted with Super:", encryptedSuper);

// // Dekripsi dengan AES
// const decryptedSuper = superDecryptMessage(encryptedSuper);
// console.log("Decrypted with Super:", decryptedSuper);

module.exports = { sendMessage, getMessages };
