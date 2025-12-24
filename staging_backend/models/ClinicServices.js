const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const ClinicServices = sequelize.define(
  "ClinicServices",
  {
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subcategory_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    clinic_id: {
      type: DataTypes.INTEGER,   // Text use kiya taaki bada description bhi store ho sake
      allowNull: true,        // Agar description optional rakhna hai
    },
  },
  {
    tableName: 'clinic_services',   // Optional: Explicit table name
    timestamps: true,        // Enables createdAt and updatedAt
    underscored: true,       // Uses snake_case for column names
  }
);

ClinicServices.associate = (models) => {
  ClinicServices.belongsTo(models.User, {
    foreignKey: "clinic_id",
    as: "clinic",
  });

  ClinicServices.belongsTo(models.Service, {
    foreignKey: "subcategory_id",   // service id column
    as: "service",
  });
};

module.exports = ClinicServices;
