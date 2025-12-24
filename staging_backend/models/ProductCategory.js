// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const ProductCategory = sequelize.define('ProductCategory', {
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  }
},
{
  tableName: 'productcategory',     // Optional: Explicit table name
  timestamps: true,             // Enables createdAt and updatedAt
  underscored: true             // Uses snake_case for column names
});



module.exports = ProductCategory;