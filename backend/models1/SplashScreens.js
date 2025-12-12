// models/SplashScreens.js
const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const SplashScreens = sequelize.define(
  'SplashScreens',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,  // ✅ TEXT if content can be long
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('image');
        // Optional: Return full URL if image path stored
        if (rawValue) {
          return `${process.env.APP_URL}${rawValue}`;
        }
        return null;
      },
    },
  },
  {
    tableName: 'splashscreens',
    timestamps: true,        // ✅ adds createdAt and updatedAt
    underscored: true,       // snake_case columns
    paranoid: true,          // ✅ adds deletedAt for soft deletes
    freezeTableName: true,   // table name won't be pluralized
  }
);

module.exports = SplashScreens;
