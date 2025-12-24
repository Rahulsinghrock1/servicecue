const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');
const User = require('@models/User');
const Client = require('@models/Client');
// const Clinic = require('@models/Clinic'); // Uncomment if you have a Clinic model

const AssignClient = sequelize.define(
  'AssignClient',
  {
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Client user ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Assigned staff ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Clinic ID',
      references: {
        model: 'clinics',
        key: 'id',
      },
    },
        notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes'
    },

      type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'type'
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Soft delete timestamp',
    },
  },
  {
    tableName: 'assign_clients',
    timestamps: true, // created_at, updated_at
    underscored: true, // snake_case
    paranoid: true, // enables soft delete
    deletedAt: 'deleted_at', // custom column
  }
);



AssignClient.belongsTo(Client, {
  foreignKey: 'client_id',
  as: 'assignedClient',
});




AssignClient.belongsTo(User, {
  foreignKey: 'staff_id',
  as: 'staff',
});


// If you have Clinic model
// AssignClient.belongsTo(Clinic, {
//   foreignKey: 'clinic_id',
//   as: 'clinic',
// });

module.exports = AssignClient;
