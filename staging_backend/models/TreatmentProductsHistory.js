const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const TreatmentProductsHistory = sequelize.define(
  'TreatmentProductsHistory',
  {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    treatment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
        dose_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
            percentage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,   // ✅ corrected `DataTypes.date` to `DataTypes.DATE`
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'treatment_products_history', // ✅ snake_case table name for consistency
    timestamps: true,                        // ✅ adds createdAt & updatedAt
    underscored: true,                       // ✅ makes columns snake_case
  }
);

module.exports = TreatmentProductsHistory;
