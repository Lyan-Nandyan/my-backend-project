const { encryptFile, decryptFile } = require('./utils/fileEncryptionUtil');
const path = require('path');
const fs = require('fs');


(async () => {
  try {

    // Dekripsi file
    await decryptFile("https://res.cloudinary.com/dk3fuf64g/raw/upload/v1731940818/xngc0f5ee91xzm2qgiuh.png");
    console.log('Dekripsi berhasil:', "https://res.cloudinary.com/dk3fuf64g/raw/upload/v1731940818/xngc0f5ee91xzm2qgiuh.png");

  } catch (error) {
    console.error('Error selama proses enkripsi/dekripsi:', error);
  }
})();