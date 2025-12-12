const { DataTypes } = require("sequelize");
const sequelize = require("@config/config");

const SubscriptionPlans = sequelize.define(
  "SubscriptionPlans",
  {
    stripe_product_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripe_price_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interval: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    post_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawImage = this.getDataValue("image");
        return rawImage ? `${process.env.APP_URL}/${rawImage}` : "";
      },
    },
  },
  {
    tableName: "subscription_plans",
    timestamps: true,
    underscored: true,
    deletedAt: 'deleted_at' // makes columns like created_at, updated_at
  }
);

module.exports = SubscriptionPlans;
