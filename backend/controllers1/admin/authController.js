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
    // -----------------------
    // 🔐 Token Validation
    // -----------------------
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ status: false, message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded?.id;
    if (!userId) {
      return res.status(401).json({ status: false, message: "Invalid token payload." });
    }

    // -----------------------
    // 👤 Find User
    // -----------------------
    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({ status: false, message: "User not found." });
    }

    // -----------------------
    // 📸 Handle File Upload
    // -----------------------
    await new Promise((resolve, reject) => {
      uploadProfilePic(req, res, (err) => (err ? reject(err) : resolve()));
    });

    // -----------------------
    // 🧾 Extract & Clean Data
    // -----------------------
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

    email = email?.trim()?.toLowerCase();
    full_name = full_name?.trim();
    clinic_name = clinic_name?.trim();
    business_name = business_name?.trim();

    // -----------------------
    // ⚠️ Validation
    // -----------------------
    if (!clinic_name) {
      return res.status(400).json({ status: false, message: "Clinic name is required." });
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ status: false, message: "Invalid email format." });
    }

    if (dob) {
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(dob)) {
        return res.status(400).json({ status: false, message: "DOB must be in YYYY-MM-DD format." });
      }
    }

    const emailExists = await User.findOne({ where: { email } });
    if (emailExists && emailExists.id !== userId) {
      return res.status(400).json({ status: false, message: "Email already in use." });
    }

    // -----------------------
    // 🛠 Build update data
    // -----------------------
    const updateData = {
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
      business_phone,
      alternate_contact_number,
      address,
      address_line2,
      city,
      state,
      postcode: postal_code, // ✅ FIXED: model attr = postcode, DB field = postal_code
      country,
      lat,
      lon,
      about,
      experience,
      specialists
    };

    // -----------------------
    // 📸 Handle file paths
    // -----------------------
    if (req.files?.avatar?.[0]) {
      updateData.avatar = `/uploads/users/${req.files.avatar[0].filename}`;
    }
    if (req.files?.clinicLogo?.[0]) {
      updateData.clinicLogo = `/uploads/clinics/${req.files.clinicLogo[0].filename}`;
    }

    console.log("🔧 Update Data =>", updateData);

    // -----------------------
    // 💾 Perform Update
    // -----------------------
    const [rowsUpdated] = await User.update(updateData, { where: { id: userId } });
    console.log("✅ Rows Updated:", rowsUpdated);

    if (rowsUpdated === 0) {
      return res.status(400).json({ status: false, message: "No changes detected or update failed." });
    }

    // -----------------------
    // 🔍 Fetch updated user
    // -----------------------
    const userDetails = await getUserDetails(userId);

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully.",
      user: userDetails
    });

  } catch (err) {
    console.error("❌ Edit Profile Error:", err);
    return res.status(500).json({
      status: false,
      message: process.env.NODE_ENV !== "production" ? err.message : "Internal server error."
    });
  }
};
