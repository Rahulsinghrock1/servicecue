const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

// Define the Specialists model
const Reviews = sequelize.define('Reviews', {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'review',
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Login User',
  },
  clinic_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Clinic ID',
  }
}, {
  tableName: 'reviews',     // Optional: Explicit table name
  timestamps: true,             // Enables createdAt and updatedAt
  underscored: true             // Uses snake_case for column names
});

module.exports = Reviews;


