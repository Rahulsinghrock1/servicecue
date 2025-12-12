const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const TreatmentProducts = sequelize.define(
  "TreatmentProducts",
  {

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    treatment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
        status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'treatmentproducts',   // Optional: Explicit table name
    timestamps: true,        // Enables createdAt and updatedAt
    underscored: true,       // Uses snake_case for column names
  }
);
module.exports = TreatmentProducts;
