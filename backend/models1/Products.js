const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const Products = sequelize.define(
  'Products',
  {
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Clinic ID',
    },
    service_categories: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Selected service categories',
    },
    treatments: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Chosen treatments',
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dose_value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    size_unit: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Unit of product size (e.g. ml, pump, tablet)',
    },
    weight: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    highlights: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    usage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ingredients: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    when_to_use: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    when_to_start: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    when_to_stop: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
       time_option: {
  type: DataTypes.STRING,
  allowNull: true,
},
    start_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    intake_mode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // ✅ Replacing timing_1 & timing_2 with an array
    timings: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of time strings like ["12:26", "13:26"]',
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sale_price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
        status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Soft delete timestamp',
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

Products.associate = (models) => {
  Products.hasOne(models.ProductPrescriptions, {
    foreignKey: 'product_id',
    as: 'prescription',
  });
};
module.exports = Products;
