const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const TreatmentPlan = sequelize.define(
  'TreatmentPlan',
  {
    treatment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service_categories: {
      type: DataTypes.TEXT,
      allowNull: true,
    },    price: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Treatment category ID"
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
        status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'treatment_plans',
    timestamps: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

TreatmentPlan.associate = (models) => {
  TreatmentPlan.belongsTo(models.Service, {
    foreignKey: "cat_id",
    as: "category",
  });
};

module.exports = TreatmentPlan;