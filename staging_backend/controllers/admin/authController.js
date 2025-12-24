require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('@models/User');
const nodemailer = require('nodemailer');
const authMiddleware = require('@middleware/tokenBlacklist');
const { addToken } = require('@middleware/tokenBlacklist');
const Otp = require('@models/Otp');
const uploadProfilePic = require("@helpers/imageUpload");
const { getUserDetails } = require('@helpers/commonHelper');
const { Op } = require("sequelize");




exports.updateProfile = async (req, res) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ status: false, message: "Authentication token is required." });
    }

    // Decode and verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({ status: false, message: "Invalid token payload." });
    }

    // Find the current user
    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({ status: false, message: "User not found." });
    }

    // Handle file upload (avatar / clinicLogo)
    await new Promise((resolve, reject) => {
      uploadProfilePic(req, res, (err) => (err ? reject(err) : resolve()));
    });

    // Extract fields from request
    let {
      full_name,
      email,
      mobile,
      country_code,
      gender,
      dob,
      clinic_name,
      business_name,
      abn,
      ownerName,
      website,
      google_review,
      business_phone,
      alternate_contact_number,
      address,
      address_line2,
      city,
      state,
      postal_code,
      country,
      lat,
      lon,
      about,
      experience,
      specialists
    } = req.body;

    // Clean data
    email = email?.trim().toLowerCase();
    full_name = full_name?.trim();
    clinic_name = clinic_name?.trim();
    business_name = business_name?.trim();

    // Required fields validation
    if ( !clinic_name) {
      return res.status(400).json({ status: false, message: "All required fields must be filled." });
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ status: false, message: "Invalid email format." });
    }

    // DOB validation
    if (dob) {
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(dob)) {
        return res.status(400).json({ status: false, message: "DOB must be in YYYY-MM-DD format." });
      }
      const parsedDate = new Date(dob);
      const [year, month, day] = dob.split("-").map(Number);
      if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() + 1 !== month ||
        parsedDate.getDate() !== day
      ) {
        return res.status(400).json({ status: false, message: "Invalid DOB." });
      }
    }

    // Check if email already in use
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists && emailExists.id !== userId) {
      return res.status(400).json({ status: false, message: "Email already in use." });
    }


    // Build update data
    let updateData = {
      email,
      mobile,
      country_code,
      gender,
      dob,
      clinic_name,
      business_name,
      abn,
      ownerName,
      website,
      google_review,
      business_phone,
      alternate_contact_number,
      address,
      address_line2,
      city,
      state,
      postcode: postal_code,
      country,
      lat,
      lon,
      about,
      experience,
      specialists
    };

    // Avatar / Clinic Logo upload
    if (req.files?.avatar?.[0]) {
      updateData.avatar = `/uploads/users/${req.files.avatar[0].filename}`;
    }
    if (req.files?.clinicLogo?.[0]) {
      updateData.clinicLogo = `/uploads/clinics/${req.files.clinicLogo[0].filename}`;
    }

    // Update user
    await existingUser.update(updateData);

    // Fetch updated user details
    const userDetails = await getUserDetails(userId);

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully.",
      user: userDetails
    });

  } catch (err) {
    console.error("Edit Profile Error:", err);
    return res.status(500).json({
      status: false,
      message: process.env.NODE_ENV !== "production" ? err.message : "Internal server error."
    });
  }
};