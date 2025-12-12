const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');
const Products = require('@models/Products'); // apna products model import karo

const ProductImages = sequelize.define(
  'ProductImages',
  {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id',
      },
      onDelete: 'CASCADE', // agar product delete hua to images bhi delete ho jayengi
    },

          image_url: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('image_url');
        if (!rawValue) return null;

        // Base path add करो
        const basePath = process.env.BASE_PATH ;
        return `${basePath}${rawValue}`;
      },
    },
    alt_text: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Alternative text for SEO',
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Image display order',
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'productimages',
    timestamps: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

// 🔗 Associations
Products.hasMany(ProductImages, {
  foreignKey: 'product_id',
  as: 'images',
});

ProductImages.belongsTo(Products, {
  foreignKey: 'product_id',
  as: 'product',
});


module.exports = ProductImages;
