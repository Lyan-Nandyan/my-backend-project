const fs = require("fs");

// Fungsi untuk menghapus file secara aman
const deleteFile = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(`Failed to delete file: ${filePath}`, error);
  }
};

module.exports = { deleteFile };