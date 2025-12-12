const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

// Define the Pages model
const Page = sequelize.define('Page', {
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Unique identifier like about-app, privacy, terms-conditions'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Page title'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'HTML/Text content of the page'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: 'Page status'
  }
}, {
  tableName: 'pages',
  timestamps: true,
  underscored: true
});

module.exports = Page;