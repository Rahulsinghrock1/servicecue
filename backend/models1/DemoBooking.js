require("module-alias/register");

const { DataTypes, Model } = require("sequelize");
const sequelize = require("@config/config");

class DemoBooking extends Model {}

DemoBooking.init(
  {
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clinic: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "DemoBooking",
    tableName: "demo_bookings",
    timestamps: true,
    freezeTableName: true, // prevents Sequelize from pluralizing table name
    paranoid: true,
  }
);

module.exports = DemoBooking;
