const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const Service = sequelize.define(
  "Service",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
        created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,   // Text use kiya taaki bada description bhi store ho sake
      allowNull: true,        // Agar description optional rakhna hai
    },
        postcare: {
      type: DataTypes.TEXT,   // Text use kiya taaki bada description bhi store ho sake
      allowNull: true,        // Agar description optional rakhna hai
    },
        precare: {
      type: DataTypes.TEXT,   // Text use kiya taaki bada description bhi store ho sake
      allowNull: true,        // Agar description optional rakhna hai
    },
  },
  {
    tableName: 'services',   // Optional: Explicit table name
    timestamps: true,        // Enables createdAt and updatedAt
    underscored: true,       // Uses snake_case for column names
  }
);



Service.associate = (models) => {
  Service.belongsTo(models.Category, {
    foreignKey: "category_id",
    as: "category",
  });
};



module.exports = Service;
