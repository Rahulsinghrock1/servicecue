const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const ClinicInstructions = sequelize.define(
  "ClinicInstructions",
  {
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
      service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
        postcare: {
      type: DataTypes.TEXT,   // Text use kiya taaki bada description bhi store ho sake
      allowNull: true,        // Agar description optional rakhna hai
    },
        precare: {
      type: DataTypes.TEXT,   // Text use kiya taaki bada description bhi store ho sake
      allowNull: true,        // Agar description optional rakhna hai
    },
  },
  {
    tableName: 'clinicinstructions',   // Optional: Explicit table name
    timestamps: true,        // Enables createdAt and updatedAt
    underscored: true,       // Uses snake_case for column names
  }
);
module.exports = ClinicInstructions;
