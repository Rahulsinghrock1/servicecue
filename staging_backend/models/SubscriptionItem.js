require("module-alias/register");

const { DataTypes, Model } = require("sequelize");
const sequelize = require("@config/config");
const Subscription = require("@models/Subscription");

class SubscriptionItem extends Model {
  toJSON() {
    const attributes = { ...this.get() };
    return attributes;
  }
}

SubscriptionItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    subscription_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "subscriptions",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    stripe_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    stripe_product: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripe_price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "SubscriptionItem",
    tableName: "subscription_items",
    timestamps: true,
    freezeTableName: true,
    indexes: [
      {
        fields: ["subscription_id", "stripe_price"],
      },
    ],
  }
);

// Relationship: each item belongs to a subscription
SubscriptionItem.belongsTo(Subscription, {
  as: "subscription_details",
  foreignKey: "subscription_id",
});

module.exports = SubscriptionItem;
