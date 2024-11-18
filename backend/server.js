const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const watermarkRoutes = require("./routes/watermarkRoutes");
const verifRoutes = require("./routes/verifRoutes");
const fileEncryptionController = require("./routes/fileEncryptRoutes");
const loadImageController = require("./routes/loadImageRoutes");
const sequelize = require("./config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Inisialisasi aplikasi Express
const app = express();

// Aktifkan CORS dengan credentials
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Aktifkan cookie-parser
app.use(cookieParser());
app.use(express.json());

// Parsing JSON body
app.use(bodyParser.json());

// Endpoint untuk registrasi dan login
app.use("/api/", verifRoutes);

// Endpoint untuk registrasi dan login
app.use("/api/auth", authRoutes);

// Endpoint untuk Chat
app.use("/api/chat", chatRoutes);

// Endoint untuk Watermark
app.use("/api/watermark", watermarkRoutes);

// Endoint untuk eknripsi file
app.use("/api/file", fileEncryptionController);

// Endoint untuk eknripsi file
app.use("/api", loadImageController);

// Sinkronisasi database
const PORT = process.env.PORT; // Gunakan default 5000 jika PORT tidak diset
sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
