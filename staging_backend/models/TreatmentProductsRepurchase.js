const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const TreatmentProductsRepurchase = sequelize.define(
  'TreatmentProductsRepurchase',
  {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
        user_id: {
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
    tableName: 'treatment_products_repurchase', 
    timestamps: true,                        
    underscored: true,
  }
);

module.exports = TreatmentProductsRepurchase;
