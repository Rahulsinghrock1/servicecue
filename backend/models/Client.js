// models/User.js
require("module-alias/register");
const { DataTypes } = require("sequelize");
const sequelize = require("@config/config");

const Client = sequelize.define(
  "Client",
  {
    firstName: { type: DataTypes.STRING, allowNull: true,field: "firstName" },
    lastName: { type: DataTypes.STRING, allowNull: true,field: "lastName"},
    full_name: { type: DataTypes.STRING, allowNull: true },
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: true },
    mobile: { type: DataTypes.STRING, unique: true, allowNull: false },
    country_code: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },

    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("avatar");
        if (!rawValue) {
          return `${process.env.APP_URL}/uploads/users/no-profile.jpg`;
        }
        return `${process.env.APP_URL}${rawValue}`;
      },
    },

    address: { type: DataTypes.STRING, allowNull: true },
    lat: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    lon: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
        postcode: { 
  type: DataTypes.STRING, 
  allowNull: true,
  field: "postal_code"   // 👈 Database me jo naam hai wahi likho
},
        user_id: { 
  type: DataTypes.INTEGER, 
  allowNull: true,
  field: "user_id"   // 👈 Database me jo naam hai wahi likho
},

    created_by: { type: DataTypes.INTEGER, allowNull: true },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "clients",
    timestamps: true,
    underscored: true,
  }
);


Client.associate = (models) => {
  Client.hasMany(models.AssignClient, {
    foreignKey: "client_id",
    as: "assignedClient",
  });
};




module.exports = Client;
