const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const Notifications = sequelize.define(
  'Notifications',
  {
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
        user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    route_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'notifications', 
    timestamps: true,                        
    underscored: true,
  }
);

module.exports = Notifications;
