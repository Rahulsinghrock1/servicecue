const User = require('@models/User');
const Client = require('@models/Client');
const StaffCertificates = require('@models/StaffCertificates');
const AssignClient = require('@models/AssignClient');
const { Sequelize } = require('sequelize');
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const admin = require("@config/firebase");
const Subscription = require("@models/Subscription");
const SubscriptionPlans = require("@models/SubscriptionPlans");
const Notifications = require('@models/Notifications');



const safeParse = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'object') return [parsed];
    return [parsed];
  } catch {
    return [value];
  }
};



exports.getStaffsWithClientCount = async (req, res) => {
  try {
    let { clinic_id } = req.body;

    // clinic_id required check
    if (!clinic_id) {
      return res.status(400).json({
        message: "clinic_id is required",
      });
    }

    // force convert to number
    clinic_id = Number(clinic_id);

    if (isNaN(clinic_id)) {
      return res.status(400).json({
        message: "clinic_id must be a valid number",
      });
    }

    const users = await User.findAll({
      where: { created_by: clinic_id },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: AssignClient,
         
          attributes: [], // सिर्फ count चाहिए, details नहीं
          required: false, // अगर किसी staff का client assign नहीं है तो भी आएगा
        },
      ],
      attributes: {
        include: [
          [Sequelize.fn("COUNT", Sequelize.col("AssignClients.id")), "clientCount"],
        ],
      },
      group: ["User.id"],
    });

    return res.status(200).json({
      message: "List fetched successfully!",
      data: users,
      filters: { clinic_id },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};

exports.getAssignedClientsByStaff = async (req, res) => {
  try {
    const { staff_id } = req.body;
    if (!staff_id) {
      return res.status(400).json({ message: "Staff ID is required" });
    }
    // ✅ Fetch staff details
    const staff = await User.findOne({
      where: { id: staff_id },
      attributes: ['id', 'full_name', 'avatar', 'designation'],
    });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    // ✅ Fetch only type: 1 clients assigned to this staff
    const assignedClients = await AssignClient.findAll({
      where: {
        staff_id,
      },
      attributes: ['id', 'notes', 'staff_id', 'client_id', 'createdAt'], // ✅ Explicitly request 'created_at'
      include: [
        {
          model: Client,
          as: 'assignedClient',
          attributes: ['id', 'full_name', 'avatar'],
        },
      ],
    });
    // ✅ Format the response
    const formattedAssignedClients = assignedClients.map(client => ({
      id: client.id,
      created_at: client.createdAt, // ✅ Now this will be present
      notes: client.notes,
      staff_id: client.staff_id,
      client_id: client.client_id,
      client: client.assignedClient,
    }));

    return res.status(200).json({
      message: "Assigned clients fetched successfully",
      staff,
      assignedClients: formattedAssignedClients,
    });

  } catch (error) {
    console.error("Error fetching assigned clients:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};




exports.unassignClient = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID are required" });
    }

    // Find and delete the assignment
    const deleted = await AssignClient.destroy({
      where: { id },
    });

    if (deleted) {
      return res.status(200).json({ message: "Client unassigned successfully" });
    } else {
      return res.status(404).json({ message: "Assignment not found" });
    }
  } catch (error) {
    console.error("Error unassigning client:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


exports.AssignedClients = async (req, res) => {
  try {
    const { staff_id, client_ids, clinic_id, notes } = req.body;

    // ✅ Validate input
    if (!staff_id || !Array.isArray(client_ids) || client_ids.length === 0 || !clinic_id) {
      return res.status(400).json({
        status: false,
        message: "Staff ID, client IDs, and clinic ID are required.",
      });
    }

    // ✅ Get already assigned client_ids for this staff and clinic
    const existingAssignments = await AssignClient.findAll({
      where: { staff_id, clinic_id },
      attributes: ['client_id'],
    });

    const existingClientIds = existingAssignments.map((item) => item.client_id);

    // ✅ Filter out already assigned clients
    const newClientIds = client_ids.filter((id) => !existingClientIds.includes(id));
    const alreadyAssigned = client_ids.filter((id) => existingClientIds.includes(id));

    // ✅ If all selected clients are already assigned
    if (newClientIds.length === 0) {
      return res.status(200).json({
        status: false,
        message: "Client(s) already assigned.",
        already_assigned: alreadyAssigned,
      });
    }

    // ✅ Insert only new assignments
    const newAssignments = newClientIds.map((client_id) => ({
      staff_id,
      client_id,
      clinic_id,
      notes,
    }));

    await AssignClient.bulkCreate(newAssignments);


        const staff_details = await User.findOne({
      where: { id: staff_id },
      attributes: ["id", "full_name", "push_token"],
    });

const message = {
  token: staff_details.push_token,
  notification: {
    title: "Assign Client",
    body: `You have been assigned to handle  treatment.`,
  },
  data: {
    type: "Assign Client",
    id: staff_id.toString(),        // ✅ must be string
    staff_id: staff_id.toString(),  // ✅ must be string
  },
};

    await Notifications.create({
  title: message.notification.title,
  user_id: staff_details.id, // recipient user ID
  route_id: 1,       // related treatment ID
  type: message.data.type,      // "Treatment Close"
  status: 0,                    // unread
});


   try {
      await admin.messaging().send(message);
      console.log("✅ Firebase notification sent successfully");
    } catch (fcmError) {
      console.error("❌ Firebase notification error:", fcmError);
    }
    return res.status(200).json({
      status: true,
      message:
        alreadyAssigned.length > 0
          ? `Some clients assigned successfully. ${alreadyAssigned.length} already assigned.`
          : "Clients assigned successfully.",
      already_assigned: alreadyAssigned,
    });
  } catch (error) {
    console.error("Error assigning clients:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};



exports.staffDetails = async (req, res) => {
    try {
          const { id } = req.params;
    const user = await User.findOne({ where: { id: id } });
    if (!user) return res.status(404).json({ error: "staff not found" });
        return res.status(200).json({
      status: true,
      message: "Profile updated successfully.",
      user: user
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    return null;
  }
};


exports.SaveOrUpdateStaff = async (req, res) => {
  try {
    let {
      id, // If id exists, it's an update
      full_name,
      phone,
      email,
      dob,
      address,
      city,
      state,
      country,
      postcode,
      employeeCode,
      licenseNo,
      about,
      designation,
      gender,
      languages,
      expertise,
      experience,
      created_by,
    } = req.body;
  // Step 1: Find user's active subscription
    

if (!full_name) {
  return res.status(400).json({
    status: false,
    message: "Full Name is required.",
  });
}

if (!email) {
  return res.status(400).json({
    status: false,
    message: "Email is required.",
  });
}

    // Check if the DOB is at least 18 years ago
const birthDate = new Date(dob);
const today = new Date();
let age = today.getFullYear() - birthDate.getFullYear(); // Use let instead of const
const m = today.getMonth() - birthDate.getMonth();

if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
  age--;
}

if (age < 18) {
  return res.status(400).json({
    status: false,
    message: "Staff must be at least 18 years old.",
  });
}

    // ✅ Force role = 2
    const user_role_id = 2;

    // ✅ Ensure fields are strings
    designation = typeof designation === "string" ? designation : "";
    languages = typeof languages === "string" ? languages : "";
    expertise = typeof expertise === "string" ? expertise : "";

    // ✅ File paths (avatar + certificates)
    const avatar = req.files?.avatar?.[0]?.filename
      ? `/uploads/users/${req.files.avatar[0].filename}`
      : null;

    // ✅ Check uniqueness of email and phone (excluding current record if updating)
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { mobile: phone }
        ],
        ...(id ? { id: { [Op.ne]: id } } : {}) // exclude current staff from check
      }
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Email or phone number is already in use by another staff member.",
      });
    }

    let staff;

    if (id) {
      // =================== ✅ UPDATE STAFF ===================
      staff = await User.findByPk(id);
      if (!staff) {
        return res.status(404).json({
          status: false,
          message: "Staff not found.",
        });
      }

      const updateData = {
        full_name,
        email,
        dob,
        mobile: phone,
        address,
        city,
        state,
        country,
        postcode,
        employeeCode,
        licenseNo,
        about,
        designation,
        gender,
        languages,
        expertise,
        experience,
        user_role_id,
        updated_by: created_by || null,
      };

      // ✅ Only add avatar if uploaded
      if (avatar) {
        updateData.avatar = avatar;
      }

      await staff.update(updateData);

      // ✅ Add new certificates (if uploaded)
      if (req.files?.certificates?.length > 0) {
        const certificatesData = req.files.certificates.map((file) => ({
          staff_id: staff.id,
          image_url: `/uploads/certificates/${file.filename}`,
          created_by: req.user?.id || null,
        }));

        await StaffCertificates.bulkCreate(certificatesData);
      }

      return res.status(200).json({
        status: true,
        message: "Staff updated successfully.",
        staff,
      });

    } else {

    const activeSubscription = await Subscription.findOne({
      where: {
        user_id: created_by,
        stripe_status: "active"
      },
      attributes: ["id", "user_id", "stripe_price"],
      order: [["id", "DESC"]],
    });
    if (!activeSubscription) {
      return res.status(400).json({
        status: false,
        message: "No active subscription found. Please subscribe to a plan.",
      });
    }
    console.log(activeSubscription,"CSController-438-activeSubscription:");
    // Step 2: Fetch plan details from SubscriptionPlans using stripe_price
    const plan = await SubscriptionPlans.findOne({
      where: { stripe_price_id: activeSubscription.stripe_price },
      attributes: ["id","title"],
    });
    if (!plan) {
      return res.status(400).json({
        status: false,
        message: "Invalid subscription plan. Please contact support.",
      });
    }
    // Step 3: Define limits dynamically by plan ID
    const STAFF_LIMITS = {
      1: 1,        // Plan ID 1 → 1 staff
      2: 5,        // Plan ID 2 → 5 staff
      3: 12,      // Plan ID 3 → 12 staff
      18: Infinity, // Plan ID 18 → unlimited
    };
    const planId = plan.id;
    const staffLimit = STAFF_LIMITS[planId] ?? Infinity;
    // Step 4: Count how many staff are already created
    const totalStaff = await User.count({
      where: {
        user_role_id: 2, // staff
        created_by: created_by,
      },
    });
    // Step 5: Enforce plan-based limit
    if (staffLimit !== Infinity && totalStaff >= staffLimit) {
      return res.status(400).json({
        status: false,
        message: `You’ve reached your staff limit for the ${plan.title} plan (${staffLimit}). Please upgrade to add more staff members.`,
      });
    }

      // =================== ✅ CREATE STAFF ===================
      const plainPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      staff = await User.create({
        avatar,
        full_name,
        email,
        dob,
        mobile: phone,
        address,
        city,
        state,
        country,
        postcode,
        employeeCode,
        licenseNo,
        about,
        designation,
        gender,
        languages,
        expertise,
        experience,
        user_role_id,
        terms_accepted: "Yes",
        created_by: created_by || null,
        password: hashedPassword,
      });

      // ✅ Certificates
      if (req.files?.certificates?.length > 0) {
        const certificatesData = req.files.certificates.map((file) => ({
          staff_id: staff.id,
          image_url: `/uploads/certificates/${file.filename}`,
          created_by: req.user?.id || null,
        }));

        await StaffCertificates.bulkCreate(certificatesData);
      }

      // ✅ Send credentials email
      // const transporter = nodemailer.createTransport({
      //   host: process.env.MAIL_HOST,
      //   port: process.env.MAIL_PORT,
      //   secure: false,
      //   auth: {
      //     user: process.env.MAIL_USER,
      //     pass: process.env.MAIL_PASS,
      //   },
      //   logger: true,
      //   debug: true,
      // });

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

      const loginUrl = `${process.env.FRONTEND_URL}/login`;

      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: '👋 Your Account Has Been Created!',
        html: `
          <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px; background-color: #ffffff;">
            <div style="text-align: center;">
              <img src="https://servicecue.com.au/web/assets/img/logo.png" alt="ServiceCue Logo" style="max-height: 60px; margin-bottom: 20px;">
            </div>
            
            <h2 style="color: #2D89EF; text-align: center;">Your Staff Account is Ready!</h2>
            
            <p style="font-size: 16px; color: #333;">
              Hello <strong>${full_name || "there"}</strong>,
            </p>

            <p style="font-size: 16px; color: #333;">
              You are now apart of the growing beauty professionals on the Service Cue™ platform
            </p>

               <p style="font-size: 16px; color: #333;">
              Your account has been successfully created. You can now log in to the platform using the credentials below:
            </p>

            <div style="background-color: #f4f8fb; border-left: 4px solid #2D89EF; padding: 15px; margin: 20px 0;">
              <p style="font-size: 16px; color: #333; margin: 0;"><strong>Email:</strong> ${email}</p>
              <p style="font-size: 16px; color: #333; margin: 0;"><strong>Password:</strong> ${plainPassword}</p>
            </div>

            <p style="font-size: 16px; color: #333;">
              🔐 <em>If you have any questions, just reply to this email—we’re happy to assist.</em>
            </p>

            <p style="font-size: 16px; color: #333;">
    Kind regards,<br/>
    <strong>Your Service Cue™ Team</strong>
  </p>
          </div>
        `,
      });

      return res.status(201).json({
        status: true,
        message: "Staff added successfully. Login credentials sent to email.",
        staff,
      });
    }
  } catch (err) {
    console.error("SaveStaff Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};






exports.staffCertificates = async (req, res) => {
  try {
    const { staff_id } = req.body;

    if (!staff_id) {
      return res.status(400).json({ error: "Staff Id is required" });
    }

    const portfolio = await StaffCertificates.findAll({
      where: { staff_id },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      message: "Certificates successfully",
      data: portfolio,
    });
  } catch (error) {
    console.error("GetClinicPortfolio Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.DeleteStaffCertificates = async (req, res) => {
  try {
    const { id } = req.params;
    const portfolio = await StaffCertificates.findByPk(id);
    if (!portfolio) {
      return res.status(404).json({ error: "Image not found" });
    }
    await portfolio.destroy();
    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("DeleteClinicPortfolio Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};




exports.unassignStaff = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID are required" });
    }

    // Find and delete the assignment
    const deleted = await AssignClient.destroy({
      where: { id },
    });

    if (deleted) {
      return res.status(200).json({ message: "Client unassigned successfully" });
    } else {
      return res.status(404).json({ message: "Assignment not found" });
    }
  } catch (error) {
    console.error("Error unassigning client:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};




