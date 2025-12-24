// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const Productmetaoption = sequelize.define('Productmetaoption', {
  meta_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Parent ID',
  },
    title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
},
{
  tableName: 'productmetaoption',     // Optional: Explicit table name
  timestamps: true,             // Enables createdAt and updatedAt
  underscored: true             // Uses snake_case for column names
});

module.exports = Productmetaoption;