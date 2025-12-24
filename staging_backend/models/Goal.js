const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const Goal = sequelize.define(
  "Goal",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    treatment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
        status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'goal',   // Optional: Explicit table name
    timestamps: true,        // Enables createdAt and updatedAt
    underscored: true,       // Uses snake_case for column names
  }
);
module.exports = Goal;
