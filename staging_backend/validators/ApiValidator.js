const { body } = require("express-validator");

exports.demoBookingValidator = [
  body("first_name").notEmpty().withMessage("First Name is required"),
  body("last_name").notEmpty().withMessage("Last Name is required"),
  body("email")
    .isEmail()
    .withMessage("Valid email is required"),

  // Phone validation: check if numeric, valid length and unique
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isNumeric()
    .withMessage("Phone number must be numeric")
    .isLength({ min: 4, max: 12 })
    .withMessage("Phone number must be between 4 and 12 digits"),
  body("country_code").notEmpty().withMessage("Country code is required"),
  body("clinic").notEmpty().withMessage("Clinic is required"),
];