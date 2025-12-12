// Assuming you're using Sequelize as ORM for the 'User' model
const User = require('@models/User');

const getUserDetails = async (userId) => {
  try {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      console.log('User not found!');
      return null;
    }
    const userData = user.get({ plain: true });
    delete userData.password;

    return userData;
  } catch (err) {
    console.error('Error fetching user details:', err);
    return null;
  }
};

module.exports = {
  getUserDetails,
};