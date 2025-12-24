require("dotenv").config();
require("module-alias/register");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const db = require("@models");
const apiRoutes = require("@routes/api");
const StripeWebhookController = require("@controllers/StripeWebhookController");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Make sure STRIPE_SECRET_KEY is set in .env

const app = express();

/* ======================================================
   🔐 SECURITY MIDDLEWARE
====================================================== */

// 1️⃣ Helmet: adds security headers
app.use(helmet());

// 2️⃣ Rate limiting: limits API calls per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api", apiLimiter);

// 3️⃣ Body parser with size limits
app.use(express.json({ limit: "10kb" })); // Limit JSON payloads to 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/* ======================================================
   🔐 CORS CONFIGURATION (SECURE & FIXED)
====================================================== */

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow Postman / server-to-server / Stripe
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ======================================================
   💳 STRIPE WEBHOOK (RAW BODY REQUIRED + SIGNATURE VERIFICATION)
====================================================== */

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post(
  "/stripe/webhook/handle",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        stripeWebhookSecret
      );
    } catch (err) {
      console.error("⚠️ Stripe signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Pass the verified event to your controller
    StripeWebhookController.handleStripeWebhook(event, req, res);
  }
);

/* ======================================================
   🗂️ STATIC FILES
====================================================== */

app.use(express.static("public"));
const fileRoutes = require("@routes/file.routes");
app.use("/files", fileRoutes);

/* ======================================================
   🚀 API ROUTES
====================================================== */

app.use("/api", apiRoutes);

/* ======================================================
   ❌ ERROR HANDLER
====================================================== */

app.use((err, req, res, next) => {
  if (err.message === "CORS not allowed") {
    return res.status(403).json({
      success: false,
      message: "CORS policy does not allow access from this origin",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* ======================================================
   🔊 SERVER START
====================================================== */

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
