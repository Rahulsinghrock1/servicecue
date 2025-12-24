require("module-alias/register");
const sequelize = require("@config/config");
const User = require("@models/User");
const Subscription = require("@models/Subscription");
const SubscriptionPlans = require("@models/SubscriptionPlans");
const responseHelper = require("@helpers/ResponseHelper");
const { validationResult } = require("express-validator");
const { fileUploadOnServer } = require("@helpers/FileUploadHelper");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { Op, fn, col } = require("sequelize");
const moment = require("moment");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.getPlansList = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;

    const plans = await SubscriptionPlans.findAll({
      where: { deleted_at: null }   // ⭐ Deleted rows won't be shown
    });

    if (!plans || plans.length === 0) {
      return responseHelper.sendError(res, "Plans not found");
    }

    const returnData = {
      plan_list: plans,
    };

    return responseHelper.sendResponse(
      res,
      returnData,
      "Plans list fetched successfully"
    );
  } catch (error) {
    console.error("Profile fetch error:", error);
    return responseHelper.sendError(res, "Internal Server Error", 500);
  }
};
// Subscribe user
exports.subscribeUser = async (req, res) => {
  try {
    const { priceId } = req.body;
    //const userId = req.user.id;
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;

    if (!priceId) {
      return responseHelper.sendError(res, "Price ID is required");
    }

    const plan = await SubscriptionPlans.findOne({ where: {stripe_price_id: priceId}});
    if (!plan) {
      return responseHelper.sendError(res, "Plans not found");
    }

    // Find user
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return responseHelper.sendError(res, "User not found");
    }

    // Create Stripe Customer if not exists
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
      });
      customerId = customer.id;
      user.stripe_customer_id = customerId;
      await user.save();
    }

    let mode = plan.interval === 'one_time' ? 'payment' : 'subscription';
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `https://servicecue.com.au/successpage`,
      cancel_url: `https://servicecue.com.au`,
    });

    // Return session URL
    return responseHelper.sendResponse(
      res,
      { url: session.url },
      "Checkout session created"
    );
  } catch (error) {
    console.error("Subscription error:", error);
    return responseHelper.sendError(res, "Internal Server Error", 500);
  }
};

// Get user subscription details
exports.mySubscription = async (req, res) => {
  try {
   // const userId = req.user.id;
        const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;
    // Fetch active subscriptions for the user
    const activeSubscriptions = await Subscription.findAll({
      where: {
        user_id: userId,
        stripe_status: "active",
      },
      attributes: ["stripe_price"],
    });
    const activeStripePrices = activeSubscriptions.map(
      (sub) => sub.stripe_price
    );
    // Load all plans with features
    const plans = await SubscriptionPlans.findAll({});
    // Mark if user is subscribed to each plan
    const plansWithStatus = await Promise.all(
      plans.map(async (plan) => {
        const subscribed = await Subscription.findOne({
          where: {
            user_id: userId,
            stripe_price: plan.stripe_price_id,
            stripe_status: "active",
          },
        });

        return {
  ...plan.toJSON(),
  subscribed: !!subscribed, // true / false
  ends_at: subscribed ? subscribed.ends_at : null, // add ends_at if exists, else null
};
      })
    );

    // Check if user has any active plan
    const isActivePlan = activeStripePrices.length > 0;

    // Return response
    const returnData = {
      plans: plansWithStatus,
      is_active_plan: isActivePlan,
    };

    return responseHelper.sendResponse(
      res,
      returnData,
      "Subscription details fetched successfully"
    );
  } catch (error) {
    console.error("mySubscription API error:", error);
    return responseHelper.sendError(res, "Internal Server Error", 500);
  }
};

// Change subscription plan
exports.changePlan = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;
    const { priceId } = req.body; // New plan price ID
    if (!priceId) {
      return responseHelper.sendError(res, "Price ID is required", 400);
    }

    // Find user's active subscription
    const activeSubscription = await Subscription.findOne({
      where: { 
        user_id: userId,
        stripe_status: "active"
      },
      include: [
        {
          model: SubscriptionPlans,
          as: "planDetails",
          where: { 
            interval: "monthly"
          },
        }
      ],
      order: [["createdAt", "DESC"]], // latest first
    });

    if (!activeSubscription || !activeSubscription.stripe_id) {
      return responseHelper.sendError(res, "No active subscription found", 400);
    }

    // Retrieve subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      activeSubscription.stripe_id
    );

    if (!stripeSubscription || !stripeSubscription.items?.data?.length) {
      return responseHelper.sendError(
        res,
        "Stripe subscription not found or invalid",
        400
      );
    }

    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(
      activeSubscription.stripe_id,
      {
        cancel_at_period_end: false, // keep subscription active
        items: [
          {
            id: stripeSubscription.items.data[0].id, // current subscription item
            price: priceId, // new plan price ID
          },
        ],
      }
    );

    // // Update local DB with new stripe_price
    // activeSubscription.stripe_price = priceId;
    // await activeSubscription.save();

    return responseHelper.sendResponse(
      res,
      updatedSubscription,
      "Subscription plan changed successfully"
    );
  } catch (error) {
    console.error("Change plan error:", error);
    return responseHelper.sendError(res, "Internal Server Error", 500);
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
           const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;

    // Find user's active subscription
     const activeSubscription = await Subscription.findOne({
      where: { 
        user_id: userId,
        stripe_status: "active"
      },
      include: [
        {
          model: SubscriptionPlans,
          as: "planDetails",
          where: { 
            interval: "monthly"
          },
        }
      ],
      order: [["createdAt", "DESC"]], // latest first
    });

    if (!activeSubscription || !activeSubscription.stripe_id) {
      return responseHelper.sendError(res, "No active subscription found", 400);
    }

    // Cancel Stripe subscription at period end
    await stripe.subscriptions.update(activeSubscription.stripe_id, {
      cancel_at_period_end: true,
    });

    // // Update local DB
    // activeSubscription.stripe_status = "canceled"; // mark as canceled in DB
    // await activeSubscription.save();

    return responseHelper.sendResponse(
      res,
      {},
      "Your subscription has been canceled successfully."
    );
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return responseHelper.sendError(res, "Internal Server Error", 500);
  }
};

exports.getMySubscriptionDetails = async (req, res) => {
  try {
           const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;

    // 1️⃣ Get all active subscriptions for this user
    const activeSubscriptions = await Subscription.findAll({
      where: {
        user_id: userId,
        stripe_status: "active",
      },
    });

    // 2️⃣ If no subscriptions found
    if (!activeSubscriptions.length) {
      return responseHelper.sendResponse(
        res,
        {
          subscriptions: [],
          is_active_plan: false,
          current_listings: 0,
        },
        "No active subscriptions found"
      );
    }

    // 3️⃣ Fetch plan details for each subscription (custom join)
    const subscriptionsWithPlans = await Promise.all(
      activeSubscriptions.map(async (sub) => {
        const plan = await SubscriptionPlans.findOne({
          where: { stripe_price_id: sub.stripe_price },
        });

        return {
          ...sub.toJSON(),
          plan_details: plan ? plan.toJSON() : null,
        };
      })
    );

    // 4️⃣ Find all staff under this dealer
    const staffList = await User.findAll({
      where: { parent_id: userId },
      attributes: ["id"],
    });

    const staffIds = staffList.map((s) => s.id);
    const allUserIds = [userId, ...staffIds];

    // 5️⃣ Count total active listings for this user and staff
    const currentListings = await Listing.count({
      where: {
        user_id: { [Op.in]: allUserIds },
      },
    });

    // 6️⃣ Prepare final response
    const returnData = {
      subscriptions: subscriptionsWithPlans,
      is_active_plan: subscriptionsWithPlans.length > 0,
      current_listings: currentListings,
    };

    return responseHelper.sendResponse(
      res,
      returnData,
      "Subscription details fetched successfully"
    );
  } catch (error) {
    console.error("mySubscription API error:", error);
    return responseHelper.sendError(res, "Internal Server Error", 500);
  }
};

