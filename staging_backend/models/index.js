const fs = require('fs');
const path = require('path');
const sequelize = require('@config/config');
require('module-alias/register');
const User = require('@models/User');
const { addToken } = require('@middleware/tokenBlacklist');
const dbSync = {};
// Load all models
fs.readdirSync(path.join(__dirname))
  .filter(file => file !== 'index.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    dbSync[model.name] = model;
  });
// Call associate to set up relations
Object.keys(dbSync).forEach(modelName => {
  if (dbSync[modelName].associate) {
    dbSync[modelName].associate(dbSync);
  }
});
async function syncModelsInOrder() {
  try {
    await dbSync.DemoBooking.sync({ force: false });
    await dbSync.User.sync({ force: false });
    await dbSync.SplashScreens.sync({ force: false });
    await dbSync.Category.sync({ force: false });
    await dbSync.Otp.sync({ force: false });
    await dbSync.SendEnquiry.sync({ force: false });
    await dbSync.Specialists.sync({ force: false });
    await dbSync.Clinic.sync({ force: false });
    await dbSync.Reviews.sync({ force: false });
    await dbSync.Progress.sync({ force: false });
    await dbSync.Faqs.sync({ force: false });
    await dbSync.Page.sync({ force: false });
    await dbSync.AssignClient.sync({ force: false });
    await dbSync.TreatmentPlan.sync({ force: false });
    await dbSync.Products.sync({ force: false });
    await dbSync.ProductImages.sync({ force: false });
    await dbSync.Service.sync({ force: false });
    await dbSync.ClinicServices.sync({ force: false });
    await dbSync.ClinicPortfolio.sync({ force: false });
    await dbSync.ClinicOperational.sync({ force: false });
    await dbSync.StaffCertificates.sync({ force: false });
    await dbSync.ClinicFollow.sync({ force: false });
    await dbSync.Client.sync({ force: false });
    await dbSync.ClinicInstructions.sync({ force: false });
    await dbSync.ProductPrescriptions.sync({ force: false });
       await dbSync.ProgressComments.sync({ force: false });
    await dbSync.ProgressImage.sync({ force: false });
    await dbSync.Goal.sync({ force: false });
    await dbSync.TreatmentProducts.sync({ force: false });
    await dbSync.ProductCategory.sync({ force: false });
    await dbSync.ProductMeta.sync({ force: false });
    await dbSync.Productmetaoption.sync({ force: false });
    await dbSync.Treatment.sync({ force: false });
    await dbSync.TreatmentProductsHistory.sync({ force: false });
    await dbSync.TreatmentProductsRepurchase.sync({ force: false });
    await dbSync.Subscription.sync({ force: false });
    await dbSync.SubscriptionItem.sync({ force: false });
    await dbSync.SubscriptionPlans.sync({ force: false });
    await dbSync.Notifications.sync({ force: false });
  } catch (error) {
    console.error('Error syncing models:', error);
  }
}
syncModelsInOrder();


dbSync.sequelize = sequelize;
dbSync.Sequelize = require('sequelize');
module.exports = dbSync;