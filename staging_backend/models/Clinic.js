const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const Clinic = sequelize.define('Clinic', {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  specialists: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  experiences: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
    desscription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  services: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
    website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
     phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Loggin User',
  }
}, {
  tableName: 'clinic',   // optional: custom table name
  timestamps: true,              // adds createdAt and updatedAt fields
  underscored: true              // uses snake_case column names
});

module.exports = Clinic;
