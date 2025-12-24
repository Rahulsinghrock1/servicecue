require("module-alias/register");
const sequelize = require("@config/config");
const responseHelper = require("@helpers/ResponseHelper");
const Subscription = require("@models/Subscription");
const SubscriptionItem = require("@models/SubscriptionItem");
const User = require("@models/User");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { Op } = require("sequelize");

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // ✅ Verify Stripe signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      /* ---------------------------------------------------------------------
       SUBSCRIPTION EVENTS
      --------------------------------------------------------------------- */
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // ✅ Get the user linked to this Stripe customer
        const user = await User.findOne({
          where: { stripe_customer_id: customerId },
        });

        if (!user) {
          console.warn(`⚠️ No user found for customer ID: ${customerId}`);
          break;
        }

        // ✅ Check if subscription already exists
        let sub = await Subscription.findOne({
          where: { stripe_id: subscription.id },
        });

        const subData = {
          user_id: user.id,
          type: "default",
          stripe_id: subscription.id,
          stripe_status: subscription.status,
          stripe_price: subscription.items.data[0].price.id,
          quantity: subscription.items.data[0].quantity || 1,
          trial_ends_at: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
          ends_at: subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000)
            : null,
        };

        if (sub) {
          // 🔁 Update existing subscription
          await sub.update(subData);
        } else {
          // 🆕 Create new subscription
          sub = await Subscription.create(subData);
        }

        // ✅ Sync subscription items safely
        await Promise.all(
          subscription.items.data.map(async (item) => {
            await SubscriptionItem.upsert({
              subscription_id: sub.id, // ✅ always defined now
              stripe_id: item.id,
              stripe_product: item.price.product,
              stripe_price: item.price.id,
              quantity: item.quantity || 1,
            });
          })
        );

        break;
      }

      /* ---------------------------------------------------------------------
       INVOICE PAYMENT SUCCEEDED
      --------------------------------------------------------------------- */
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (!subscriptionId) {
          console.warn("⚠️ Missing subscription ID in invoice");
          break;
        }

        await Subscription.update(
          { stripe_status: "active" },
          { where: { stripe_id: subscriptionId } }
        );
        break;
      }

      /* ---------------------------------------------------------------------
       SUBSCRIPTION DELETED / CANCELED
      --------------------------------------------------------------------- */
      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        await Subscription.update(
          {
            stripe_status: "canceled",
            ends_at: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : new Date(),
          },
          { where: { stripe_id: subscription.id } }
        );

        break;
      }


      case "checkout.session.completed":{
        
        console.log(event);
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // ✅ Get the user linked to this Stripe customer
        const user = await User.findOne({
          where: { stripe_customer_id: customerId },
        });

        if (!user) {
          console.warn(`⚠️ No user found for customer ID: ${customerId}`);
          break;
        }

        const dateAfter90Days = new Date();
        dateAfter90Days.setDate(dateAfter90Days.getDate() + 90);

        const subData = {
          user_id: user.id,
          type: "default",
          stripe_id: subscription.id,
          stripe_status: subscription.status === "complete" ? "active" : subscription.status,
          stripe_price: "price_1SS69QPjbTwQMG5ukyvFNFAO",
          quantity: 1,
          trial_ends_at: null,
          ends_at: dateAfter90Days,
        };
        
        sub = await Subscription.create(subData);

        // ✅ Sync subscription items safely
        await SubscriptionItem.upsert({
          subscription_id: sub.id, // ✅ always defined now
          stripe_id: subscription.id,
          stripe_product: "prod_TOtxZOS58fxnvq",
          stripe_price: "price_1SS69QPjbTwQMG5ukyvFNFAO",
          quantity: 1,
        });

        break;
      }

      /* ---------------------------------------------------------------------
       DEFAULT
      --------------------------------------------------------------------- */
      default:
        console.log("⚠️ Unhandled event type:", event.type);
    }

    // ✅ Always respond to Stripe (important to stop retries)
    return res.json({ received: true });
  } catch (error) {
    console.error("⚠️ Webhook handler error:", error);
    return res.status(500).end();
  }
};
