const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const watermarkRoutes = require("./routes/watermarkRoutes");
const verifRoutes = require("./routes/verifRoutes");
const loadImageController = require("./routes/loadImageRoutes");
const Delete = require("./routes/DeleteRoutes");
const sequelize = require("./config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Inisialisasi aplikasi Express
const app = express();

// Aktifkan CORS dengan credentials
app.use(
  cors({
    origin: 'http://localhost:5173', // Pastikan ini sesuai dengan alamat frontend Anda
    credentials: true, // Jika Anda menggunakan cookies atau header khusus
  })
);

// Aktifkan cookie-parser
app.use(cookieParser());
app.use(express.json());

// Parsing JSON body
app.use(bodyParser.json());

app.use(Delete);
app.use("/api/", verifRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/watermark", watermarkRoutes);
app.use("/api", loadImageController);

// Sinkronisasi database
const PORT = process.env.PORT; // Gunakan default 5000 jika PORT tidak diset
sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
