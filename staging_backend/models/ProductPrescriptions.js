const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const ProductPrescriptions = sequelize.define(
  'ProductPrescriptions',
  {
    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Staff ID',
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Product ID',
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Client ID',
    },
        treatment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Treatment ID',
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dose_value: {
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
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
 expected_end_time: {
  type: DataTypes.DATE,
  allowNull: true,
},
 expected_days: {
  type: DataTypes.STRING,
  allowNull: true,
},
    intake_mode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
        special_instraction: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // ✅ Replacing timing_1 & timing_2 with an array
    timings: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of time strings like ["12:26", "13:26"]',
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Soft delete timestamp',
    },
  },
  {
    tableName: 'productprescriptions',
    timestamps: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

ProductPrescriptions.associate = (models) => {
  ProductPrescriptions.belongsTo(models.Products, {
    foreignKey: 'product_id',
    as: 'product',
  });
};

module.exports = ProductPrescriptions;
