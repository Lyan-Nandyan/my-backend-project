const CryptoJS = require("crypto-js");
require("dotenv").config();

const encryptionKey = process.env.RC4_SECRET_KEY; // Ganti menjadi kunci untuk RC4

// Fungsi untuk mengenkripsi dengan RC4
const encryptRC4 = (message) => {
  return CryptoJS.RC4.encrypt(message, encryptionKey).toString();
};

// Fungsi untuk mendekripsi dengan RC4
const decryptRC4 = (encryptedMessage) => {
  const bytes = CryptoJS.RC4.decrypt(encryptedMessage, encryptionKey);
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
  const encryptedWithRC4 = encryptRC4(message, encryptionKey); // Enkripsi dengan RC4
  const encryptedWithCaesar = caesarCipher(encryptedWithRC4, caesarShift); // Enkripsi dengan Caesar
  return encryptedWithCaesar;
};

const superDecryptMessage = (message, caesarShift = 3) => {
  // Dekripsi dengan Caesar
  const decryptedWithCaesar = caesarCipher(message, -caesarShift);
  // Dekripsi dengan RC4
  const originalText = decryptRC4(decryptedWithCaesar, encryptionKey);
  return originalText;
};

// Test Fungsi
// const message = "Hello World!";
// const encryptedMessageCaesar = caesarCipher(message, 3); // Enkripsi dengan Caesar
// console.log("Encrypted with Caesar:", encryptedMessageCaesar);

// const decryptedMessageCaesar = caesarCipher(encryptedMessageCaesar, -3); // Dekripsi dengan Caesar
// console.log("Decrypted with Caesar:", decryptedMessageCaesar);

// Enkripsi dengan RC4
// const encryptedMessage = encryptRC4("Hello World!");
// console.log("Encrypted with RC4:", encryptedMessage);

// Dekripsi dengan RC4
// const decryptedMessage = decryptRC4(encryptedMessage);
// console.log("Decrypted with RC4:", decryptedMessage);

// Enkripsi dengan Super (RC4 + Caesar)
// const encryptedSuper = superEncryptMessage("Hello World!");
// console.log("Encrypted with Super:", encryptedSuper);

// Dekripsi dengan Super
// const decryptedSuper = superDecryptMessage(encryptedSuper);
// console.log("Decrypted with Super:", decryptedSuper);

module.exports = { superEncryptMessage, superDecryptMessage };
