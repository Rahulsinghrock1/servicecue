require("module-alias/register");
const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const Progress = sequelize.define('Progress', {

treatment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Treatment ID',
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
  }
},{
  tableName: 'progress',   // optional: custom table name
  timestamps: true,              // adds createdAt and updatedAt fields
  underscored: true              // uses snake_case column names
});

  Progress.associate = (models) => {
    Progress.hasMany(models.ProgressImage, {
      foreignKey: 'progress_id',
      as: 'images',
    });
    Progress.hasMany(models.ProgressComments, {
      foreignKey: 'progress_id',
      as: 'comments',
    });
Progress.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user',
});




  };

module.exports = Progress;
