require("module-alias/register");

const { DataTypes, Model } = require("sequelize");
const sequelize = require("@config/config");
const User = require("@models/User");

class Subscription extends Model {
  toJSON() {
    const attributes = { ...this.get() };
    return attributes;
  }
}

Subscription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripe_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    stripe_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripe_price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    trial_ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ends_at: {
      type: DataTypes.DATE,
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
    modelName: "Subscription",
    tableName: "subscriptions",
    timestamps: true,
    freezeTableName: true,
    indexes: [
      {
        fields: ["user_id", "stripe_status"],
      },
    ],
  }
);

// Relationship: each subscription belongs to a user
Subscription.belongsTo(User, {
  as: "user_details",
  foreignKey: "user_id",
});

module.exports = Subscription;
