const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const Treatment = sequelize.define(
  'Treatment',
  {
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    concerns: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    additional_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "additional_notes",
    },

    front: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("front");
        if (!rawValue) {
          return ``; // default image
        }
        return `${process.env.BASE_PATH}${rawValue}`;
      },
    },
    left: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("left");
        if (!rawValue) {
          return ``;
        }
        return `${process.env.APP_URL}${rawValue}`;
      },
    },
    right: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("right");
        if (!rawValue) {
          return ``;
        }
        return `${process.env.APP_URL}${rawValue}`;
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'treatment',
    timestamps: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);




module.exports = Treatment;