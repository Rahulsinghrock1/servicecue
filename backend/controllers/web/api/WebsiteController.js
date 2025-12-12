require("module-alias/register");
const sequelize = require("@config/config");
const responseHelper = require("@helpers/ResponseHelper");
const { validationResult } = require("express-validator");
const { fileUploadOnServer } = require("@helpers/FileUploadHelper");
const { Op } = require("sequelize");
const DemoBooking = require("@models/DemoBooking");

exports.bookedDemo = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, country_code, clinic } = req.body;

    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper.sendError(res, errors.array()[0].msg);
    }

    const now = new Date();

    // Combine full name
    const full_name = `${first_name} ${last_name}`.trim();

    // Create new booking
    const user = await DemoBooking.create({
      first_name,
      last_name,
      full_name,
      email,
      phone,
      country_code,
      clinic,
      createdAt: now,
      updatedAt: now,
    });

    return responseHelper.sendResponse(res, null, "Demo booked successfully.");
  } catch (error) {
    console.error("Signup OTP error:", error);
    return responseHelper.sendError(res, "Internal Server Error", 500);
  }
};
