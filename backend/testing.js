const { encryptFile, decryptFile } = require('./utils/fileEncryptionUtil');
const path = require('path');
const fs = require('fs');


(async () => {
  try {
    
    // Dekripsi file
    await decryptFile("https://res.cloudinary.com/dk3fuf64g/raw/upload/v1731943931/cat9ntyjyee7kbcpfjaz.enc");
    console.log('Dekripsi berhasil:');

  } catch (error) {
    console.error('Error selama proses enkripsi/dekripsi:', error);
  }
})();