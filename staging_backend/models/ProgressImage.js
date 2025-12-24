require("module-alias/register");
const { DataTypes } = require('sequelize');
const sequelize = require('@config/config');

const ProgressImage = sequelize.define('ProgressImage', {

progress_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Treatment ID',
  },
image: {
  type: DataTypes.STRING,
  allowNull: true,
  comment: 'Progress Image URL',
  get() {
    const rawValue = this.getDataValue("image");
    if (!rawValue) {
      return ""; // 👈 default image
    }
    return `${process.env.APP_URL}${rawValue}`;
  }
},
    user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Loggin User',
  }
},{
  tableName: 'progressimage',   // optional: custom table name
  timestamps: true,              // adds createdAt and updatedAt fields
  underscored: true              // uses snake_case column names
});

  ProgressImage.associate = (models) => {
    ProgressImage.belongsTo(models.Progress, {
      foreignKey: 'progress_id',
    });
  };

module.exports = ProgressImage;
