const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const Newsletter = sequelize.define("Newsletter", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("subscribed", "unsubscribed"),
    defaultValue: "subscribed",
  },
}, {
  tableName: "newsletters",
  timestamps: true,
});

module.exports = Newsletter;
