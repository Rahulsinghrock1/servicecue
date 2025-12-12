require("module-alias/register");

const db = require("@models");
const express = require("express");
const cors = require("cors");
const apiRoutes = require("@routes/api");
const StripeWebhookController = require("@controllers/StripeWebhookController");

const app = express();


app.use(cors({
   origin: "*",
   credentials: true
}));

app.post(
  "/stripe/webhook/handle",
  express.raw({ type: "application/json" }),
  StripeWebhookController.handleStripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));


// ✅ Routes
app.use("/", apiRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
