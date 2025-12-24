// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const Category = sequelize.define('Category', {
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
  tableName: 'categories',     // Optional: Explicit table name
  timestamps: true,             // Enables createdAt and updatedAt
  underscored: true             // Uses snake_case for column names
});

Category.associate = (models) => {
  Category.hasMany(models.Service, {
    foreignKey: "category_id",
    as: "services",
  });
};

module.exports = Category;