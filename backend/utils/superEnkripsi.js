const CryptoJS = require("crypto-js");
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

module.exports = { superEncryptMessage, superDecryptMessage };
