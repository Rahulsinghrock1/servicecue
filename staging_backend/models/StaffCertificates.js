const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');
const Users = require('@models/User'); // Import the User model

const StaffCertificates = sequelize.define(
  'StaffCertificates',
  {
    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Assuming "Users" table stores clinic/user info
        key: 'id',
      },
      onDelete: 'CASCADE', // If user/clinic is deleted, delete portfolio images
    },

    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('image_url');
        if (!rawValue) return null;

        const basePath = process.env.NEXT_PUBLIC_APP_URL || '';
        return `${basePath}${rawValue}`;
      },
    },
  },
  {
    tableName: 'staffcertificates',
    timestamps: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);



module.exports = StaffCertificates;
