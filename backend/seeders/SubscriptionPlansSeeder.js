'use strict';

// ✅ Load .env before anything else
require('dotenv').config();

// ✅ Load aliases
require('module-alias/register');

// ✅ Get Sequelize instance
const sequelize = require('@config/config');
const SubscriptionPlans = require('@models/SubscriptionPlans');

async function SubscriptionPlansSeeder() {
  try {
    // ✅ Ensure DB connection works
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');

    // ✅ Ensure table exists (create if not)
    await SubscriptionPlans.sync({ force: false });
    console.log('✅ SubscriptionPlans table is ready.');

    const planData = [
      {
        stripe_product_id: 'prod_TFHAKmoc2GNtsO',
        stripe_price_id: 'price_1SImcbFkV20vz5IvlRxo2RuT',
        title: 'Bronze Plan',
        amount: 450,
        currency: 'AUD',
        interval: 'monthly',
        post_limit: 3,
        content: '<p>Allows up to 3 items per month.</p>',
        image: 'storage/subscription_plan/bronze-plan.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        stripe_product_id: 'prod_TFHBcSKiMkNOGy',
        stripe_price_id: 'price_1SImdFFkV20vz5IvIebIOYuT',
        title: 'Silver Plan',
        amount: 750,
        currency: 'AUD',
        interval: 'monthly',
        post_limit: 6,
        content: '<p>Allows up to 6 items per month.</p>',
        image: 'storage/subscription_plan/silver-plan.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        stripe_product_id: 'prod_TFHCs0aoX4TrcS',
        stripe_price_id: 'price_1SImddFkV20vz5IvbKHnQNgA',
        title: 'Gold Plan',
        amount: 1000,
        currency: 'AUD',
        interval: 'monthly',
        post_limit: 10,
        content: '<p>Allows up to 10 items per month.</p>',
        image: 'storage/subscription_plan/gold-plan.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        stripe_product_id: 'prod_TFHCycvTcfwsym',
        stripe_price_id: 'price_1SIme5FkV20vz5IvQm5HWqWX',
        title: 'Platinum Plan',
        amount: 2000,
        currency: 'AUD',
        interval: 'monthly',
        post_limit: 100,
        content: '<p>Allows post unlimited listings per month.</p>',
        image: 'storage/subscription_plan/platinum-plan.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await SubscriptionPlans.bulkCreate(planData, { ignoreDuplicates: true });
    console.log('🌱 Subscription plans seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding subscription plans:', err);
    process.exit(1);
  }
}

SubscriptionPlansSeeder();
