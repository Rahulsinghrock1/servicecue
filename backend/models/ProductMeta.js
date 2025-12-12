// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const ProductMeta = sequelize.define('ProductMeta', {
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
    size: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
      value: {
    type: DataTypes.STRING,
    allowNull: true,
  },
    type: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Parent ID',
  }
},
{
  tableName: 'productmeta',     // Optional: Explicit table name
  timestamps: true,             // Enables createdAt and updatedAt
  underscored: true             // Uses snake_case for column names
});



module.exports = ProductMeta;