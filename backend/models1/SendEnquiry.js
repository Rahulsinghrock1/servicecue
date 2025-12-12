const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const SendEnquiry = sequelize.define('SendEnquiry', {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Name of the person sending the enquiry',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Phone number of the sender',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Email of the sender',
  },
  service: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Service for which the enquiry is made',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Optional message',
  },
  clinic_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Associated clinic ID (if applicable)',
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Loggin User',
  },
  status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // ✅ default is 1
      comment: '0 = pending, 1 = active or new',
    },
}, {
  tableName: 'send_enquiries',   // optional: custom table name
  timestamps: true,              // adds createdAt and updatedAt fields
  underscored: true              // uses snake_case column names
});


SendEnquiry.associate = (models) => {
  SendEnquiry.belongsTo(models.Service, {
    foreignKey: "service",
    as: "serviceDetails",  // ✅ match this to the controller
  });
};

module.exports = SendEnquiry;
