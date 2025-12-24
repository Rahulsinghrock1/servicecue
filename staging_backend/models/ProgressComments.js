require("module-alias/register");
const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const ProgressComments = sequelize.define('ProgressComments', {
  comments: {
    type: DataTypes.STRING,
    allowNull: true,
  },

progress_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Progress ID',
  },
    user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Loggin User',
  }
},{
  tableName: 'progresscomments',   // optional: custom table name
  timestamps: true,              // adds createdAt and updatedAt fields
  underscored: true              // uses snake_case column names
});

  ProgressComments.associate = (models) => {
    ProgressComments.belongsTo(models.Progress, {
      foreignKey: 'progress_id',
    });
    ProgressComments.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user'
});
  };


module.exports = ProgressComments;
