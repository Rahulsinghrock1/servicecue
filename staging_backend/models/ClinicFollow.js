const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const ClinicFollow = sequelize.define(
  "ClinicFollow",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'clinic_follow',   // Optional: Explicit table name
    timestamps: true,        // Enables createdAt and updatedAt
    underscored: true,       // Uses snake_case for column names
  }
);
module.exports = ClinicFollow;
