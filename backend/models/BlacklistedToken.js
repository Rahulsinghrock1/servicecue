module.exports = (sequelize, DataTypes) => {
    const BlacklistToken = sequelize.define('BlacklistToken', {
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Ensure no duplicates in the blacklist
        },
        expired_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {});
    
    BlacklistToken.associate = function(models) {
        // Define associations here if needed
    };

    return BlacklistToken;
};
