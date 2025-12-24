// models/User.js
require("module-alias/register");
const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const Otp = sequelize.define('Otp', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otp_expiry: {
    type: DataTypes.DATE,
    allowNull: false,
  }
});


module.exports = Otp;