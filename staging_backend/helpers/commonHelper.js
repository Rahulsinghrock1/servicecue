// Assuming you're using Sequelize as ORM for the 'User' model
const User = require('@models/User');
const TreatmentPlan  = require('@models/TreatmentPlan');
const Treatment = require('@models/Treatment');
const TreatmentProductsHistory = require('@models/TreatmentProductsHistory');
const TreatmentProductsRepurchase = require('@models/TreatmentProductsRepurchase');
const ProductPrescriptions = require("@models/ProductPrescriptions");
const ProgressImage = require('@models/ProgressImage');
const ProgressComments = require('@models/ProgressComments');
const Goal = require('@models/Goal');
const TreatmentProducts = require('@models/TreatmentProducts');
const Products = require('@models/Products');

function calculateTotalSessions(productPrescriptions) {
  let total = 0;

  for (const item of productPrescriptions) {
    if (!item.start_time || !item.end_time) continue; // skip invalid records

    const start = new Date(item.start_time);
    const end = new Date(item.end_time);

    // Difference in days (inclusive)
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const timesPerDay = getTimesPerDay(item.frequency);

    const totalForThis = diffDays * timesPerDay;
    total += totalForThis;
  }

  return total;
}

function getTimesPerDay(frequencyLabel) {
  switch (frequencyLabel) {
    case "Morning Only (AM)":
    case "Evening Only (PM)":
      return 1;
    case "Morning & Evening (AM + PM)":
      return 2;
    case "Every 2nd Day":
      return 0.5; // every other day
    case "2–3 Times Weekly":
      return 0.4; // roughly 2.8 times per week
    default:
      return 1;
  }
}

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



const treatmentCalculation = async (treatmentId) => {
  try {
    const totalTreatments = await TreatmentPlan.count({
      where: { treatment_id: treatmentId },
    });

    const completedTreatments = await TreatmentPlan.count({
      where: {
        treatment_id: treatmentId,
        status: 1,
      },
    });

    const goals = await Goal.findAll({
      where: { treatment_id: treatmentId },
      attributes: ["status"],
      raw: true,
    });

    const totalGoals = goals.length;
    const completedGoals = goals.filter(
      (g) =>
        g.status === 1 ||
        g.status === "1" ||
        g.status === "completed"
    ).length;

    const totalProducts = await TreatmentProducts.count({
      where: { treatment_id: treatmentId },
    });


      const productPrescriptions = await ProductPrescriptions.findAll({
      where: { treatment_id: treatmentId },
      raw: true,
    });

          const totalSessions = calculateTotalSessions(productPrescriptions);
              const TotalTreatmentcount = await TreatmentProductsHistory.count({
  where: { treatment_id: treatmentId },
});


  const percentage = totalSessions ? (TotalTreatmentcount / totalSessions) * 100 : 0;
const formattedPercentage = percentage.toFixed(2); // 2 decimal places

return {
  totaltreatments: `${completedTreatments}/${totalTreatments}`,
  totalgoals: `${completedGoals}/${totalGoals}`,
  totalproduct: `${totalProducts}`,
  formattedPercentage: formattedPercentage || "0",
};


  } catch (err) {
    console.error('Error calculating treatment data:', err);
    return null;
  }
};

module.exports = {
  getUserDetails,treatmentCalculation
};