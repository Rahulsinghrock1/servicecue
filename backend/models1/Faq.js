const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

// Define the Faqs model
const Faqs = sequelize.define('Faqs', {
  question: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'FAQ Question',
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'FAQ Answer',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
    comment: 'FAQ status (active/inactive)',
  }
}, {
  tableName: 'faqs',        // Table name
  timestamps: true,         // created_at, updated_at
  underscored: true         // snake_case columns
});

module.exports = Faqs;