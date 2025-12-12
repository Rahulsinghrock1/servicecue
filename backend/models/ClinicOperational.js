const { DataTypes } = require('sequelize');
const sequelize = require('@config/config'); // Apne sequelize instance ka path

const ClinicOperational = sequelize.define(
  "ClinicOperational",
  {
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("workingDay", "break"),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "clinic_operational_details",
    timestamps: true,
    underscored: true, // agar column names ko snake_case me rakhna ho
  }
);


module.exports = ClinicOperational;
