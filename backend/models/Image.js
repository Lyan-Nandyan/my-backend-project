const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Image = sequelize.define('Image', {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  link: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Mark', 'noMark'),
    allowNull: false,
  },
});

module.exports = Image;
