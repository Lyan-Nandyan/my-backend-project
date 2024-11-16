const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const sequelize = require('./config/database');
require("dotenv").config();

// Inisialisasi aplikasi Express
const app = express();
app.use(bodyParser.json());

// Endpoint untuk registrasi
app.use('/api/auth', authRoutes);

// Sinkronisasi database
PORT = process.env.PORT
sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});