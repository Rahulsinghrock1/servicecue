const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

// Define the Specialists model
const Specialists = sequelize.define('Specialists', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the specialist',
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Job title or specialization',
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Image path or URL',
  },
  clinic_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Clinic to which the specialist belongs',
  }
}, {
  tableName: 'specialists',     // Optional: Explicit table name
  timestamps: true,             // Enables createdAt and updatedAt
  underscored: true             // Uses snake_case for column names
});

module.exports = Specialists;
