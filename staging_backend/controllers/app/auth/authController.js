require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('@models/User');
const Client = require('@models/Client');
const nodemailer = require('nodemailer');
const authMiddleware = require('@middleware/tokenBlacklist');
const { addToken } = require('@middleware/tokenBlacklist');
const Otp = require('@models/Otp');
const uploadProfilePic = require("@helpers/imageUpload");
const { getUserDetails } = require('@helpers/commonHelper');
const { Op } = require("sequelize");
const Stripe = require("stripe");
const Subscription = require("@models/Subscription");
const SubscriptionPlans = require("@models/SubscriptionPlans");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
 // Import the function
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();
// const generateOtp = () => "1234";
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  secure: false, // important: STARTTLS
  auth: {
    user: process.env.MAIL_USER.trim(),
    pass: process.env.MAIL_PASS.trim(),
  },
  tls: {
    rejectUnauthorized: false,
  },
});
exports.sendOtp = async (req, res) => {
  try {
    const email = req?.body?.email;
    const isForgot = req.body.is_forgot || req.body.isForgot;

    if (!email) {
      return res.status(400).json({ status: false, message: 'Email is required.' });
    }

    const isEmailValid = /\S+@\S+\.\S+/.test(email);
    if (!isEmailValid) {
      return res.status(400).json({ status: false, message: 'Invalid email format.' });
    }

    // ✅ Sirf tab email check karo jab forgot password ka case ho
  if (isForgot === true) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).json({
      status: false,
      message: 'Email not found. Please enter a registered email.'
    });
  }
}

    // OTP Generate
    //const otp = 1234; // aap yahan generateOtp() bhi use kar sakte ho

    const otp = generateOtp(); // aap yahan generateOtp() bhi use kar sakte ho o
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // ✅ Save or update OTP
    await Otp.upsert({ email, otp, otp_expiry: otpExpiry });

    // ✅ Send OTP Email
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: '🔐 Your OTP Code',
      html: `
       <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px; background-color: #ffffff;">
  <div style="text-align: center;">
    <img src="https://servicecue.com.au/web/assets/img/logo.png" alt="Service Cue Logo" style="max-height: 60px; margin-bottom: 20px;">
  </div>

  <h2 style="color: #2D89EF; text-align: center; margin-bottom: 20px;">Verify Your Identity 🔐</h2>

  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
    Please use the following OTP (One-Time Password) to complete your verification process:
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <span style="font-size: 28px; font-weight: bold; color: #2D89EF;">${otp}</span>
  </div>

  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
    This OTP is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.
  </p>

  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
    Need help? Just reply to this email — we’re here for you.
  </p>

  <p style="font-size: 16px; color: #333;">
    Kind regards,<br/>
    <strong>Your Service Cue™ Team</strong>
  </p>
</div>
      `,
    });

    // ✅ Optional JWT token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '8h' });

    return res.status(200).json({
      status: true,
      message: 'OTP sent successfully.',
      token,
    });

  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
};

// exports.verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({
//         status: false,
//         message: 'Email and OTP are required.'
//       });
//     }

//     // Find OTP record for the email
//     const otpRecord = await Otp.findOne({ where: { email } });

//     if (!otpRecord) {
//       return res.status(404).json({
//         status: false,
//         message: 'No OTP found for this email.'
//       });
//     }

//     // Check if OTP matches
//     if (otpRecord.otp !== otp) {
//       return res.status(400).json({
//         status: false,
//         message: 'Invalid OTP.'
//       });
//     }

//     // Check if OTP is expired
//     if (new Date() > otpRecord.otp_expiry) {
//       return res.status(400).json({
//         status: false,
//         message: 'OTP has expired.'
//       });
//     }

//     // ✅ Find user by email
//     const user = await User.findOne({ where: { email } });

//     let verifiedStatus = false;

//     if (user && user.user_role_id === 4) {
//       // Update isVerified flag in DB
//       user.isVerified = 1;
//       await user.save();
//       verifiedStatus = true;
//     }

//     // OTP verified → delete or clear it
//     await otpRecord.destroy();

//     return res.status(200).json({
//       status: true,
//       message: 'OTP verified successfully.',
//       verifiedStatus: verifiedStatus
//     });

//   } catch (err) {
//     console.error('Verify OTP Error:', err);
//     return res.status(500).json({
//       status: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
//     });
//   }
// };

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: false,
        message: 'Email and OTP are required.'
      });
    }

    // ✅ Find the latest OTP record for the email
    const otpRecord = await Otp.findOne({ 
      where: { email },
      order: [['created_at', 'DESC']] // latest OTP first
    });

    if (!otpRecord) {
      return res.status(404).json({
        status: false,
        message: 'No OTP found for this email.'
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        status: false,
        message: 'Invalid OTP.'
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.otp_expiry) {
      return res.status(400).json({
        status: false,
        message: 'OTP has expired.'
      });
    }

    // ✅ Find user by email
    const user = await User.findOne({ where: { email } });

    let verifiedStatus = false;

    if (user && user.user_role_id === 4) {
      // Update isVerified flag in DB
      user.isVerified = 1;
      await user.save();
      verifiedStatus = true;
    }

    // OTP verified → delete it
    await otpRecord.destroy();

    return res.status(200).json({
      status: true,
      message: 'OTP verified successfully.',
      verifiedStatus: verifiedStatus
    });

  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
};


exports.Logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required.' });
    }
    addToken(token);


    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prepare update data
    let updateData = {
      push_token: null,
    };

    // Update user
    await existingUser.update(updateData);


    return res.status(200).json({
      status: true,
      message: 'Logged out successfully.',
    });

  } catch (err) {
    return res.status(401).json({
      status: false,
      message: 'Invalid or expired token.',
    });
  }
};

exports.register = async (req, res) => {
  try {
    // ✅ Step 1: Handle file upload (multer) as a promise
    await new Promise((resolve, reject) => {
      uploadProfilePic(req, res, (err) => (err ? reject(err) : resolve()));
    });

    // ✅ Step 2: Extract body fields
    let {
      clinic_name,
      full_name,
      firstName,
      lastName,
      email,
      mobile,
      country_code,
      gender,
      dob,
      password,
      confirm_password,
      terms_accepted,
      push_token,
      device_type,
      user_type
    } = req.body;

    // ✅ Step 3: Convert and clean inputs
    email = email?.trim().toLowerCase();
    full_name = full_name?.trim();
    firstName = firstName?.trim() || null;
    lastName = lastName?.trim() || null;

    // ✅ Step 4: Basic validations
    if (!full_name || !email || !mobile || !password || !confirm_password) {
      return res.status(400).json({ status: false, message: 'All required fields must be filled.' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ status: false, message: 'Invalid email format.' });
    }

    if (!terms_accepted || terms_accepted === 'false') {
      return res.status(400).json({ status: false, message: 'You must accept terms and conditions.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ status: false, message: 'Passwords do not match.' });
    }

    // ✅ Step 5: Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { mobile }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          status: false,
          message: 'Email already registered.'
        });
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({
          status: false,
          message: 'Mobile number already registered.'
        });
      }
    }

    if (!user_type) {
      if (!dob) {
        return res.status(400).json({ status: false, message: 'Date of birth is required.' });
      }
      // ✅ Check date format YYYY-MM-DD
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(dob)) {
        return res.status(400).json({ status: false, message: 'Date of birth must be in YYYY-MM-DD format.' });
      }

      // ✅ Check if it's a valid date
      const parsedDate = new Date(dob);
      const [year, month, day] = dob.split('-').map(Number);
      if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() + 1 !== month ||
        parsedDate.getDate() !== day
      ) {
        return res.status(400).json({ status: false, message: 'Invalid date of birth.' });
      }
    }

    // ✅ Step 6: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user_role_id = user_type ? user_type : 1;

    // ✅ Step 7: Profile picture path (if uploaded)
    const avatar = req.files?.avatar ? `/uploads/users/${req.files.avatar[0].filename}` : null;

    // ✅ Step 8: Create user
    const newUser = await User.create({
      clinic_name,
      avatar,
      firstName,
      lastName,
      full_name,
      email,
      mobile,
      country_code,
      gender,
      dob,
      push_token,
      device_type,
      password: hashedPassword,
      terms_accepted,
      user_role_id
    });


    const existingClient = await Client.findOne({
  where: { email: email }
});

if (existingClient) {
  await Client.update(
    { user_id: newUser.id },
    { where: { email: email } }
  );
}



    // ✅ Step 9: Remove password from response
    const userResponse = { ...newUser.toJSON() };
    delete userResponse.password;
    const userDetails = await getUserDetails(newUser.id);

    // ✅ Step 10: Generate token
const token = jwt.sign(
  { id: newUser.id, role: user_role_id },
  process.env.JWT_SECRET
);

    // ✅ Step 11: Send Welcome Email
try {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: '🎉 Welcome to Our Platform!',
    html: `
      <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px; background-color: #ffffff;">
        <div style="text-align: center;">
          <img src="https://servicecue.com.au/web/assets/img/logo.png" alt="Logo" style="max-height: 60px; margin-bottom: 20px;">
        </div>
        <h2 style="color: #2D89EF; text-align: center;">Welcome to Service Cue! 🎉</h2>
        <p style="font-size: 16px; color: #333;">
          Hi <strong>${full_name || "there"}</strong>,
        </p>
        <p style="font-size: 16px; color: #333;">
          We're thrilled to have you join our platform! You're now part of a growing community of awesome people 🚀
        </p>
        <p style="font-size: 16px; color: #333;">
          If you have any questions, feel free to reply to this email. We’re here to help!
        </p>
        <p style="font-size: 16px; color: #333;">
    Warm regards,<br/>
    <strong>Shamara Jarrett</strong><br/>
    Founder | <strong>Service Cue™</strong>
  </p>
      </div>
    `,
  });

  //console.log("✅ Welcome email sent to", email);
} catch (mailErr) {
  console.error("❌ Welcome email error:", mailErr.message);
}

    return res.status(201).json({
      status: true,
      message: 'User registered successfully.',
      user: userDetails,
      token,
    });

  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error.',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
};


exports.login = async (req, res) => {
  try {
    let { email, password, user_type, push_token, device_type } = req.body;

    // -------------------------------
    // 🔹 Validation
    // -------------------------------
    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      return res.status(400).json({
        status: false,
        message: "Invalid email format.",
      });
    }

    if (!password) {
      return res.status(400).json({
        status: false,
        message: "Password is required.",
      });
    }

    if (!user_type) {
      return res.status(400).json({
        status: false,
        message: "User type is required.",
      });
    }

    email = email.trim().toLowerCase();

    // -------------------------------
    // 🔹 Fetch user
    // -------------------------------
    const user = await User.findOne({
      where: { email },
      attributes: [
        "id",
        "full_name",
        "email",
        "password",
        "mobile",
        "country_code",
        "gender",
        "dob",
        "user_role_id",
        "status",
      ],
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "The email you entered is not registered. Please check and try again.",
      });
    }

    // -------------------------------
    // 🔹 Check active status
    // -------------------------------
    if (user.status !== "1" && user.status !== 1 && user.status !== true) {
      return res.status(403).json({
        status: false,
        message: "Your account is inactive/deleted. Please contact support.",
      });
    }

    // -------------------------------
    // 🔹 Role check
    // -------------------------------
    const roleNames = {
      1: "User",
      2: "Staff",
      3: "Super Admin",
      4: "Clinic",
    };

    if (
      parseInt(user_type) !== 3 &&
      parseInt(user.user_role_id) !== parseInt(user_type)
    ) {
      return res.status(404).json({
        status: false,
        message:
          "Invalid login details! Please check your email and password and try again.",
      });
    }

    // -------------------------------
    // 🔹 Password verification
    // -------------------------------
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid  password.",
      });
    }

    // -------------------------------
    // 🔹 Generate JWT (No Expiry)
    // -------------------------------
    const secret = process.env.JWT_SECRET || "fallback_secret";

    const token = jwt.sign(
      { id: user.id, role: user.user_role_id },
      secret
    ); // ❌ No expiresIn → unlimited token

    // -------------------------------
    // 🔹 Update push_token & device_type
    // -------------------------------
    if (push_token || device_type) {
      await User.update(
        {
          push_token: push_token || null,
          device_type: device_type || null,
          last_login_at: new Date(), // optional field for tracking
        },
        { where: { id: user.id } }
      );
    }

    // -------------------------------
    // 🔹 Get full user details
    // -------------------------------
    const userDetails = await getUserDetails(user.id);
const activeSubscription = await Subscription.findOne({
  where: {
    user_id: user.id,
    stripe_status: {
      [Op.or]: ["active", "complete"]
    }
  },
  attributes: ["id", "user_id"],
});


    // -------------------------------
    // ✅ Response
    // -------------------------------
    return res.status(200).json({
      status: true,
      message: "Login successful.",
      token, // unlimited token
      user: userDetails,
      activeSubscription: activeSubscription,
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error:
        process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};


// exports.profileDetails = async (req, res) => {
//   try {
//     // Get token from header
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "Authentication token is required." });
//     }

//     // Verify and decode token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

//     // In your login code, you signed token with { userId: user.id }
//     const userId = decoded.id;
//     if (!userId) {
//       return res
//         .status(401)
//         .json({ message: "Invalid token payload. No userId found.",data:decoded });
//     }

//     // Fetch user details
//     const userDetails = await getUserDetails(userId);

//     return res.status(200).json({
//       status: true,
//       message: "Details Found",
//       user: { userId, ...userDetails },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: err.message,
//     });
//   }
// };

exports.profileDetails = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Authentication token is required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "Invalid token payload.",
      });
    }

    const userDetails = await getUserDetails(userId);

    // Fetch ACTIVE OR COMPLETE subscription with plan details
    const activeSubscription = await Subscription.findOne({
      where: {
        user_id: userId,
        stripe_status: ["active", "complete"],
      },
      include: [
        {
          model: SubscriptionPlans,
          as: "planDetails",
          attributes: [
            "id",
            "title",
            "stripe_product_id",
            "stripe_price_id",
            "amount",
            "currency",
            "interval",
            "post_limit",
            "content",
            "image"
          ]
        }
      ]
    });

    return res.status(200).json({
      status: true,
      message: "Details Found",
      user: { userId, ...userDetails },
      activeSubscription: activeSubscription,
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};


exports.editProfile = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Handle file upload
    await new Promise((resolve, reject) => {
      uploadProfilePic(req, res, (err) => (err ? reject(err) : resolve()));
    });

    // Extract and clean fields
    let {
      full_name,
      email,
      mobile,
      country_code,
      gender,
      dob
    } = req.body;

    email = email?.trim().toLowerCase();
    full_name = full_name?.trim();
    mobile = mobile?.trim();
    country_code = country_code?.trim();

    // Normalize mobile number (remove leading 0s)
    const normalizedMobile = mobile?.replace(/^0+/, '') || "";
    const existingMobile = existingUser.mobile?.replace(/^0+/, '') || "";
    const sameMobile = normalizedMobile === existingMobile;

    // Validations
    if (!full_name || !email || !mobile) {
      return res.status(400).json({ status: false, message: "All required fields must be filled." });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ status: false, message: "Invalid email format." });
    }
    // ✅ Handle DOB cleanly (nullify invalid or empty)
    if (!dob || dob === "0000-00-00" || dob === "Invalid date" || dob.trim() === "") {
      dob = null;
    } else {
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

    // Check for duplicate email if changed
    if (email !== existingUser.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists && emailExists.id !== userId) {
        return res.status(400).json({ status: false, message: "Email already in use." });
      }
    }

    // ✅ Check for duplicate mobile regardless of country_code
    if (!sameMobile) {
      const mobileExists = await User.findOne({
        where: {
          mobile: normalizedMobile,
        },
      });

      if (mobileExists && mobileExists.id !== userId) {
        return res.status(400).json({ status: false, message: "Mobile number already in use." });
      }
    }

    // Prepare update data
    let updateData = {
      full_name,
      email,
      mobile: normalizedMobile,
      country_code,
      gender,
      dob,
    };

    if (req.files?.avatar?.[0]) {
      updateData.avatar = `/uploads/users/${req.files.avatar[0].filename}`;
    }

    // Update user
    await existingUser.update(updateData);

    const userDetails = await getUserDetails(userId);

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully.",
      user: userDetails,
    });

  } catch (err) {
    console.error("Edit Profile Error:", err);
    return res.status(500).json({
      status: false,
      message: process.env.NODE_ENV !== "production" ? err.message : "Internal server error.",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id; // Middleware se aapko login user ka id milega

    // Step 1: Confirm new password and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: false,message: "New Password and Confirm Password do not match." });
    }

    // Step 2: Find user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Step 3: Match old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: "Old password is incorrect." });
    }

    // Step 4: Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Step 5: Update user password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ status: true, message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Something went wrong." });
  }
};



exports.clientDetails = async (req, res) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token is required." });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    // In your login code, you signed token with { userId: user.id }
    const userId = decoded.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Invalid token payload. No userId found.",data:decoded });
    }

    // Fetch user details
    const userDetails = await getUserDetails(userId);

    return res.status(200).json({
      status: true,
      message: "Details Found",
      user: { userId, ...userDetails },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};



exports.clinicRegister = async (req, res) => {
  try {
    // ✅ Step 1: Handle file upload (multer) as a promise
    await new Promise((resolve, reject) => {
      uploadProfilePic(req, res, (err) => (err ? reject(err) : resolve()));
    });

    // ✅ Step 2: Extract body fields
    let {
      clinic_name,
      full_name,
      firstName,
      lastName,
      email,
      mobile,
      country_code,
      gender,
      dob,
      password,
      push_token,
      confirm_password,
      terms_accepted,
      bookingSystem,
      user_type
    } = req.body;

    // ✅ Step 3: Convert and clean inputs
    email = email?.trim().toLowerCase();
    full_name = full_name?.trim();
    firstName = firstName?.trim() || null;
    lastName = lastName?.trim() || null;

    // ✅ Step 4: Basic validations
    if (!full_name || !email || !mobile || !password || !confirm_password) {
      return res.status(400).json({ status: false, message: 'All required fields must be filled.' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ status: false, message: 'Invalid email format.' });
    }

    if (!terms_accepted || terms_accepted === 'false') {
      return res.status(400).json({ status: false, message: 'You must accept terms and conditions.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ status: false, message: 'Passwords do not match.' });
    }

    // ✅ Step 5: Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { mobile }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          status: false,
          message: 'Email already registered.'
        });
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({
          status: false,
          message: 'Mobile number already registered.'
        });
      }
    }

    // ✅ Step 6: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user_role_id = user_type ? user_type : 1;

    // ✅ Step 7: Profile picture path (if uploaded)
    const avatar = req.files?.avatar ? `/uploads/users/${req.files.avatar[0].filename}` : null;

    // ✅ Step 8: Create user
    const newUser = await User.create({
      clinic_name,
      avatar,
      firstName,
      lastName,
      full_name,
      email,
      mobile,
      country_code,
      gender,
      dob,
      push_token,
      password: hashedPassword,
      bookingSystem,
      terms_accepted,
      user_role_id
    });


    const stripeCustomer = await stripe.customers.create({
      name: newUser.full_name || `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim(),
      email: newUser.email,
      metadata: {
        user_id: newUser.id,
      },
    });

    // Save stripe_id to user
    newUser.stripe_customer_id = stripeCustomer.id;
    await newUser.save();
    //console.log("✅ Stripe customer created:", stripeCustomer.id);

    // ✅ Step 9: Remove password from response
    const userResponse = { ...newUser.toJSON() };
    delete userResponse.password;
    const userDetails = await getUserDetails(newUser.id);

    // ✅ Step 10: Generate token
    const token = jwt.sign(
      { id: newUser.id, role: user_role_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

   

    // ✅ Step 12: Return response
    return res.status(201).json({
      status: true,
      message: 'Clinic registered successfully.',
      user: userDetails,
      token,
    });

  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error.',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
};


exports.skiplogin = async (req, res) => {
  try {
    const STATIC_EMAIL = "skipuser@gmail.com";
    const STATIC_PASSWORD = "1234";

    // -------------------------------
    // 🔹 Fetch user by static email
    // -------------------------------
    let user = await User.findOne({
      where: { email: STATIC_EMAIL },
      attributes: [
        "id",
        "full_name",
        "email",
        "password",
        "mobile",
        "country_code",
        "gender",
        "dob",
        "user_role_id",
        "status",
      ],
    });

    const hashedPassword = await bcrypt.hash(STATIC_PASSWORD, 10);

    // -------------------------------
    // 🔹 If user doesn't exist -> create
    // -------------------------------
    if (!user) {
      user = await User.create({
        full_name: "Skip Login User",
        email: STATIC_EMAIL,
        password: hashedPassword,
        user_role_id: 1, // adjust default role if needed
        status: 1, // active
      });

      // refetch with attributes (so we have same shape as before)
      user = await User.findOne({
        where: { id: user.id },
        attributes: [
          "id",
          "full_name",
          "email",
          "password",
          "mobile",
          "country_code",
          "gender",
          "dob",
          "user_role_id",
          "status",
        ],
      });
    } else {
      // -------------------------------
      // 🔹 If user exists but password doesn't match -> overwrite it
      // -------------------------------
      const isMatch = await bcrypt.compare(STATIC_PASSWORD, user.password);
      if (!isMatch) {
        await User.update(
          { password: hashedPassword, status: 1 }, // ensure active
          { where: { id: user.id } }
        );

        // refetch to have up-to-date password/status
        user = await User.findOne({
          where: { id: user.id },
          attributes: [
            "id",
            "full_name",
            "email",
            "password",
            "mobile",
            "country_code",
            "gender",
            "dob",
            "user_role_id",
            "status",
          ],
        });
      }
    }

    // -------------------------------
    // 🔹 Generate JWT (No Expiry)
    // -------------------------------
    const secret = process.env.JWT_SECRET || "fallback_secret";
    const token = jwt.sign({ id: user.id, role: user.user_role_id }, secret);

    // -------------------------------
    // 🔹 Get full user details and respond
    // -------------------------------
    const userDetails = await getUserDetails(user.id);

    return res.status(200).json({
      status: true,
      message: "Skip login successful.",
      token,
      user: userDetails,
    });
  } catch (err) {
    console.error("❌ Skip Login Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};


exports.deleteAccount = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prepare update data
    let updateData = {
      status: 0,
    };

    // Update user
    await existingUser.update(updateData);

    const userDetails = await getUserDetails(userId);

    return res.status(200).json({
      status: true,
      message: "Your account has been deleted successfully.",
      user: userDetails,
    });

  } catch (err) {
    console.error("Account Delete Error:", err);
    return res.status(500).json({
      status: false,
      message: process.env.NODE_ENV !== "production" ? err.message : "Internal server error.",
    });
  }
};


exports.clinicchangePassword = async (req, res) => {
  try {
    const { id, password, email } = req.body;
    if (!id || !password || !email) {
      return res.status(400).json({ message: "ID, password, and email are required" });
    }
    // Hash new password
    const hashed = await bcrypt.hash(password, 10);
    // Update user password
    await User.update({ password: hashed }, { where: { id } });
    // ✅ Send password via email
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  secure: false, // important: STARTTLS
  auth: {
    user: process.env.MAIL_USER.trim(),
    pass: process.env.MAIL_PASS.trim(),
  },
  tls: {
    rejectUnauthorized: false,
  },
});
    return res.json({
      success: true,
      message: "Password updated  successfully!",
    });
  } catch (error) {
    console.error("Error changing clinic password:", error);
    return res.status(500).json({
      message: "Failed to update password or send email",
      error: error.message,
    });
  }
};