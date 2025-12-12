require("module-alias/register");

const db = require("@models");
const StripeWebhookController = require("@controllers/StripeWebhookController");
const express = require("express");
const cors = require("cors");
const apiRoutes = require("@routes/api");

const app = express();

// ✅ Enable CORS for Next.js frontend
app.use(cors({
  origin: "*", // ❌ Removed leading space
  credentials: true,
}));


app.post(
  "/stripe/webhook/handle",
  express.raw({ type: "application/json" }),
  StripeWebhookController.handleStripeWebhook
);


// ✅ Parse JSON and form data BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));


// ✅ Routes
app.use("/api", apiRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
