const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Client = require('@models/Client');
const AssignClient = require('@models/AssignClient');
const SendEnquiry = require('@models/SendEnquiry');
const { Sequelize, Op } = require("sequelize");
const Service = require("@models/Service");
const User = require('@models/User');
const nodemailer = require("nodemailer");
const TreatmentPlan  = require('@models/TreatmentPlan');
const Treatment = require('@models/Treatment');
const TreatmentProductsHistory = require('@models/TreatmentProductsHistory');
const Subscription = require("@models/Subscription");
const SubscriptionPlans = require("@models/SubscriptionPlans");
const Notifications = require('@models/Notifications');
const moment = require("moment"); // for date comparison
exports.getClientWithStaffCount = async (req, res) => {
  try {
    const { clinic_id = "" } = req.body;

    if (!clinic_id) {
      return res.status(400).json({
        message: "clinic_id is required in the request body.",
      });
    }

    const clients = await Client.findAll({
      where: {
        created_by: clinic_id, // ✅ filter by created_by
      },
      attributes: {
        include: [
          [
            Sequelize.fn("COUNT", Sequelize.col("assignedClient.id")), 
            "staffCount"
          ]
        ]
      },
      include: [
        {
          model: AssignClient,
          as: "assignedClient",
          attributes: [],
          where: {
            clinic_id, // still filter assigned clients
          },
          required: false,
        }
      ],
      group: ["Client.id"],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      message: "List fetched successfully!",
      data: clients,
      filters: { clinic_id },
    });

  } catch (error) {
    console.error("Error fetching clients with staff count:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};

exports.assignedStaffList = async (req, res) => {
  try {
    const { client_id } = req.body;

    if (!client_id) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    // ✅ Fetch client info
    const staff = await Client.findOne({
      where: { id: client_id },
      attributes: ['id', 'full_name', 'avatar']
    });

    if (!staff) {
      return res.status(404).json({ message: "Client not found" });
    }

    // ✅ Fetch assigned staff filtered by type = 2
    const assignedEntries = await AssignClient.findAll({
      where: { client_id }, // 👈 Filtering by type
      attributes: ['id', 'createdAt', 'notes', 'staff_id', 'client_id'], // ✅ Use createdAt
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'full_name', 'avatar', 'designation'],
        }
      ],
      order: [['createdAt', 'DESC']] // Optional: newest first
    });

    if (!assignedEntries || assignedEntries.length === 0) {
      return res.status(404).json({ message: "No assigned staff found for this client." });
    }

    // ✅ Format response
    const formattedAssignedClients = assignedEntries.map(entry => ({
      id: entry.id,
      created_at: entry.createdAt, // ✅ Correct field
      notes: entry.notes,
      staff_id: entry.staff_id,
      client_id: entry.client_id,
      client: {
        id: entry.staff?.id || null,
        full_name: entry.staff?.full_name || null,
        avatar: entry.staff?.avatar || null,
        designation: entry.staff?.designation || null
      }
    }));

    return res.status(200).json({
      message: "Assigned staff fetched successfully",
      staff: staff,
      assignedClients: formattedAssignedClients
    });

  } catch (error) {
    console.error("Error fetching assigned staff:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};


exports.SaveOrUpdateClient = async (req, res) => {



  try {
    let {
      id,
      full_name,
      phone,
      email,
      dob,
      address,
      city,
      state,
      country,
      gender,
      postcode,
      clinic_id,
      assignedStaff,
      visible_to_staff
    } = req.body;
      const rawVisible = visible_to_staff;
console.log(rawVisible, typeof rawVisible);

visible_to_staff =
  rawVisible === true ||
  rawVisible === "true" ||
  rawVisible === 1 ||
  rawVisible === "1"
    ? 1
    : 0;

    // 🔹 convert "1307,1285" → [1307,1285]
    if (typeof assignedStaff === "string") {
      assignedStaff = assignedStaff
        .split(",")
        .map((id) => parseInt(id, 10))
        .filter(Boolean);
    } else if (!Array.isArray(assignedStaff)) {
      assignedStaff = [];
    }
    // ✅ required fields validation
    if (!full_name) {
      return res.status(400).json({ status: false, message: "Full Name is required." });
    }
    if (!phone) {
      return res.status(400).json({ status: false, message: "Phone Number is required." });
    }
    if (!email) {
      return res.status(400).json({ status: false, message: "Email Address is required." });
    }

    const type = 2;
    const avatar = req.files?.avatar?.[0]?.filename
      ? `/uploads/users/${req.files.avatar[0].filename}`
      : null;
    // ✅ check duplicate email / phone
    const existingUser = await Client.findOne({
      where: {
        [Op.or]: [{ email }, { mobile: phone }],
        ...(id ? { id: { [Op.ne]: id } } : {}),
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Email or phone already exists.",
      });
    }

    
    let validDob = null;
if (dob) {
  // अगर आप moment use करते हैं:
  const m = moment(dob, moment.ISO_8601, true); // strict ISO date parse
  if (m.isValid()) {
    validDob = m.toDate();
  }
  // या vanilla JS (dob expected string)
  // const dateObj = new Date(dob);
  // if (!isNaN(dateObj.getTime())) validDob = dateObj;
}
    const existingLinkedUser = await User.findOne({ where: { email } });
    const user_id = existingLinkedUser ? existingLinkedUser.id : null;
    let client;
    if (id) {
      // ---------- UPDATE ----------
      client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({ status: false, message: "Client not found." });
      }
      const updateData = {
        full_name,
        email,
        dob:validDob,
        mobile: phone,
        address,
        city,
        state,
        country,
        gender,
        postcode,
        visible_to_staff,
        created_by: clinic_id || null,
      };
      if (avatar) updateData.avatar = avatar;
      await client.update(updateData);

      const enquiriesUpdated = await SendEnquiry.update(
        { status: 1 }, // ✅ Set status to 1
        {
          where: { email: email }, // ✅ Update all records with this email
        }
      );



      // 🔹 clear old staff assignments
      await AssignClient.destroy({ where: { client_id: id } });
      // 🔹 insert new staff assignments
      if (assignedStaff.length > 0) {
        const assignRows = assignedStaff.map((staffId) => ({
          client_id: id,
          staff_id: staffId,
          type: type,
          clinic_id: clinic_id || null,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await AssignClient.bulkCreate(assignRows);
        // 🔹 send email notification to staff
        await sendAssignmentEmails(assignedStaff, client);
      }
      return res.status(200).json({
        status: true,
        message: "Client updated successfully.",
        client,
      });
    } else {

      // Step 1: Find user's active subscription
      const activeSubscription = await Subscription.findOne({
        where: {
          user_id: clinic_id,
          stripe_status: {
            [Op.or]: ["active", "complete"]
          }
        },
        attributes: ["id", "user_id","stripe_price"],
        order: [["id", "DESC"]],
      });
      if (!activeSubscription) {
        return res.status(400).json({
          status: false,
          message: "No active subscription found. Please subscribe to a plan.",
        });
      }
      // Step 2: Fetch plan details from SubscriptionPlans using stripe_price
      const plan = await SubscriptionPlans.findOne({
        where: { stripe_price_id: activeSubscription.stripe_price },
        attributes: ["id","title"]       
      });
      console.log(plan);
      console.log(activeSubscription);
      
      
      if (!plan) {
        return res.status(400).json({
          status: false,
          message: "Invalid subscription plan. Please contact support.",
        });
      }
      // Step 3: Define client limits dynamically by plan ID
      const STAFF_LIMITS = {
        1: 150,        // Plan ID 1 → 150 client
        2: Infinity,        // Plan ID 2 → unlimited client
        3: Infinity, // Plan ID 3 → unlimited client
        18: Infinity, // Plan ID 18 → unlimited client
      };
      const planId = plan.id;
      const staffLimit = STAFF_LIMITS[planId] ?? Infinity;
      // Step 4: Count how many staff are already created
      const totalStaff = await Client.count({
        where: {
          created_by: clinic_id,
        },
      });
      // Step 5: Enforce plan-based client limit
      if (staffLimit !== Infinity && totalStaff >= staffLimit) {
        return res.status(400).json({
          status: false,
          message: `You’ve reached your client limit for the ${plan.title} plan (${staffLimit}). Please upgrade to add more client members.`,
        });
      }

      // ---------- CREATE ----------
      client = await Client.create({
        avatar,
        full_name,
        email,
        dob:validDob,
        mobile: phone,
        address,
        city,
        state,
        country,
        gender,
        postcode,
        visible_to_staff,
        created_by: clinic_id || null,
        user_id: user_id || null,
      });

      await SendEnquiry.update(
        { status: 1 }, // ✅ Update this field
        {
          where: { email: client.email }, // ✅ Update all records with same email
        }
      );

      try {
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
        const mailOptions = {
          from: process.env.MAIL_FROM,
          to: client.email, // fixed from just "email" to "client.email"
          subject: "Welcome to ServiceCue!",
          html: `
            <p>Hi ${client.full_name},</p>
            <p>You have been added to <strong>ServiceCue</strong> as a Client.</p>
            <p>Please register to access your account and complete your process:</p>
            <br/>
            <p>Thank you,<br/>ServiceCue Team</p>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Welcome email sent to:", client.email);
      } catch (err) {
        console.error("Error sending client welcome email:", err);
      }

      // 🔹 assign staff
      if (assignedStaff.length > 0) {
        const assignRows = assignedStaff.map((staffId) => ({
          client_id: client.id,
          staff_id: staffId,
            type: type,
          clinic_id: clinic_id || null,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await AssignClient.bulkCreate(assignRows);

        // 🔹 send email notification to staff
        await sendAssignmentEmails(assignedStaff, client);
      }

      return res.status(201).json({
        status: true,
        message: "Client added successfully.",
        client,
      });
    }
  } catch (err) {
    console.error("SaveOrUpdateClient Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

// ----------------- 🔹 Helper function to send emails -----------------
async function sendAssignmentEmails(staffIds, client) {
  try {
    // ✅ transporter config
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


    // ✅ get staff emails
    const staffList = await User.findAll({
      where: { id: staffIds },
      attributes: ["id", "email", "full_name"],
    });

    for (const staff of staffList) {
      const mailOptions = {
         from: process.env.MAIL_FROM,
        to: staff.email,
        subject: "New Client Assigned to You",
        html: `
        <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px; background-color: #ffffff;">
          <div style="text-align: center;">
            <img src="https://servicecue.com.au/web/assets/img/logo.png" alt="Logo" style="max-height: 60px; margin-bottom: 20px;">
          </div>
       
        <h2 style="color: #2D89EF; text-align: center;">Welcome to Service Cue! 🎉</h2>

         <p style="font-size: 16px; color: #333;">
             Hello ${staff.full_name || ""},
          </p>
         
        <p style="font-size: 16px; color: #333;">
           A new client has been assigned to you. 🚀
        </p>
         
        <p style="font-size: 16px; color: #333;">
          Client Details:
        </p>
           <p style="font-size: 16px; color: #333;">
          Name: ${client.full_name}
           </p>
           <p style="font-size: 16px; color: #333;">
          Phone: ${client.mobile}
           </p>
           <p style="font-size: 16px; color: #333;">
          Email: ${client.email}
        </p>

         <p style="font-size: 16px; color: #333;">
          Warm regards,<br/>
          <strong>Shamara Jarrett</strong><br/>
          Founder | <strong>Service Cue™</strong>
        </p>
         </div>`,
      };     

        await transporter.sendMail(mailOptions);
    }
  } catch (err) {
    console.error("Error sending assignment emails:", err);
  }
}

exports.clientDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. client details
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ status: false, message: "Client not found." });
    }

    // 2. assigned staff IDs
    const assignedStaff = await AssignClient.findAll({
      where: { client_id: id },
      attributes: ["staff_id"]
    });

    // 3. response
    return res.json({
      id: client.id,
      full_name: client.full_name,
      email: client.email,
      phone: client.mobile,
      dob: client.dob,
      address: client.address,
      city: client.city,
      state: client.state,
      country: client.country,
      gender: client.gender,
      postcode: client.postcode,
      avatar: client.avatar,
      visible_to_staff : client.visible_to_staff ,
      assignedStaff: assignedStaff.map((s) => s.staff_id) // [1307,1285,...]
    });
  } catch (err) {
    console.error("GetClient Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    const client = await Client.findByPk(clientId); // Sequelize use ho to
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    await client.destroy();

    return res.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Client Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete client",
    });
  }
};



exports.getEnquiries = async (req, res) => {
  try {
    // ✅ Get query params
    const { limit, clinic_id } = req.body;

    // ✅ Prepare query options
    const queryOptions = {
      where: {}, // <-- initialize where condition
      include: [
        {
          model: Service,
          as: "serviceDetails",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    };

    // ✅ Apply limit if provided
    if (limit && !isNaN(limit)) {
      queryOptions.limit = parseInt(limit);
    }

    // ✅ Apply clinic_id filter if provided
    if (clinic_id) {
      queryOptions.where.clinic_id = clinic_id;
    }

    // ✅ Fetch data
    const enquiries = await SendEnquiry.findAll(queryOptions);

    // ✅ Format data
    const formatted = await Promise.all(
      enquiries.map(async (e) => {
        const existingClient = await Client.findOne({
          where: { email: e.email },
          attributes: ["id"],
        });

        return {
          id: e.id,
          name: e.name || "N/A",
          phone: e.phone || "N/A",
          email: e.email || "N/A",
          service: e.serviceDetails?.name || "N/A",
          message: e.message || "-",
          status: "Active",
          createdAt: e.createdAt,
          existsInClients: !!existingClient,
          clientId: existingClient ? existingClient.id : null,
        };
      })
    );



    // Step 1: Find user's active subscription
    const activeSubscription = await Subscription.findOne({
      where: {
        user_id: clinic_id,
        stripe_status: {
          [Op.or]: ["active", "complete"]
        }
      },
      attributes: ["id", "user_id","stripe_price"],
      order: [["id", "DESC"]],
    });
    if (!activeSubscription) {
      return res.status(400).json({
        status: false,
        message: "No active subscription found. Please subscribe to a plan.",
      });
    }
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

    const STAFF_LIMITS = {
      1: 50,
      2: 100,
      3: 5000000,
      18: 5000000,
    };

    // Step 4: Get the plan ID and enquiries limit
    const planId = plan.id;
    const limit1 = STAFF_LIMITS[planId] ?? 0; // default 0 if planId not found

    // Step 5: Check enquiries count
    const currentCount = formatted.length;

    let planmessage = "";
    if (currentCount >= limit1) {
      planmessage = `You have reached your  limit (${limit1}) for your current plan. Please upgrade to show more enquiries.`;
    }

    // Step 6: Prepare response
    return res.json({
      success: true,
      data: formatted,
      limit: limit1,
      planmessage: planmessage, // message or empty ""
    });
  } catch (err) {
    console.error("❌ Enquiry List Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteEnquiries = async (req, res) => {
  try {
    const clientId = req.params.id;

    const client = await SendEnquiry.findByPk(clientId); // Sequelize use ho to
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }
    await client.destroy();
    return res.json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Client Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete client",
    });
  }
};

exports.toggleClientStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Pehle user find karo
        const user = await Client.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Status toggle karo
        user.status = !user.status;
        await user.save();

        return res.status(200).json({
            message: `User ${user.status ? 'Active' : 'Completed'} successfully!`,
            data: user
        });
    } catch (error) {
        console.error("Error updating status:", error);
        return res.status(500).json({
            message: 'Something went wrong!',
            error: error.message
        });
    }
};

exports.AssignedStaff = async (req, res) => {
  try {
    const { staff_id: client_id, client_ids: staffIds, clinic_id, notes } = req.body;

    // ✅ Validate input
    if (!client_id || !Array.isArray(staffIds) || staffIds.length === 0 || !clinic_id) {
      return res.status(400).json({
        status: false,
        message: "Client ID, staff IDs, and clinic ID are required.",
      });
    }

    // ✅ Get existing assignments for this client
    const existingAssignments = await AssignClient.findAll({
      where: { client_id, clinic_id, type: 2 },
      attributes: ["staff_id"],
    });

    const existingStaffIds = existingAssignments.map((item) => item.staff_id);

    // ✅ Filter to find new staff assignments
    const newStaffIds = staffIds.filter((id) => !existingStaffIds.includes(id));
    const alreadyAssigned = staffIds.filter((id) => existingStaffIds.includes(id));

    if (newStaffIds.length === 0) {
      return res.status(200).json({
        status: false,
        message: "Staff already assigned to this client.",
        already_assigned: alreadyAssigned,
      });
    }

    // ✅ Prepare bulk insert data
    const newAssignments = newStaffIds.map((staff_id) => ({
      client_id,
      staff_id,
      clinic_id,
      notes,
      type: 2, // fixed type
    }));

    await AssignClient.bulkCreate(newAssignments);

    // ✅ Fetch client details
    const client = await Client.findOne({
      where: { id: client_id },
      attributes: ["firstName","full_name", "lastName", "email", "mobile"],
    });

    if (!client) {
      console.warn("Client not found. Skipping email notifications.");
    } else {
      // ✅ Fetch staff details
      const staffList = await User.findAll({
        where: { id: newStaffIds },
        attributes: ["id", "email", "firstName","full_name","lastName"],
      });

    // ✅ transporter config
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
      // ✅ Send email to each staff member
      for (const staff of staffList) {

        const mailOptions = {
           from: process.env.MAIL_FROM,
          to: staff.email,
          subject: "New Client Assigned to You",
          html: `
            <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px; background-color: #ffffff;">
              <div style="text-align: center;">
                <img src="https://servicecue.com.au/web/assets/img/logo.png" alt="Logo" style="max-height: 60px; margin-bottom: 20px;">
              </div>
              <h2 style="color: #2D89EF; text-align: center;">New Client Assigned 👤</h2>
              <p style="font-size: 16px; color: #333;">Hello <strong>${staff.full_name || ""}</strong>,</p>
              <p style="font-size: 16px; color: #333;">You’ve been assigned a new client. Here are the details:</p>
              <ul style="font-size: 16px; color: #333; padding-left: 20px;">
                <li><strong>Name:</strong> ${client.full_name}</li>
                <li><strong>Phone:</strong> ${client.mobile || "N/A"}</li>
                <li><strong>Email:</strong> ${client.email}</li>
              </ul>
              <p style="font-size: 16px; color: #333;">Please login to the system to view more details.</p>
              <br/>
              <p style="font-size: 16px; color: #333;">Best regards,<br/>Team</p>
              <hr style="margin: 40px 0; border: none; border-top: 1px solid #e0e0e0;" />
              <p style="font-size: 12px; color: #999; text-align: center;">
                You’re receiving this email because you’re registered on our platform.<br/>
                If this wasn’t you, please ignore this email.
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      }
    }

    return res.status(200).json({
      status: true,
      message:
        alreadyAssigned.length > 0
          ? `Some staff assigned successfully. ${alreadyAssigned.length} already assigned.`
          : "Staff assigned successfully.",
      already_assigned: alreadyAssigned,
    });
  } catch (error) {
    console.error("Error assigning staff to client:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.PastTreatmentPlanList = async (req, res) => {
  try {
    const { client_id } = req.body; // this is actually the treatment ID

    // ✅ Step 1: Fetch the treatment to get clinic_id
    const treatment = await Treatment.findOne({
      where: { id: client_id },
      attributes: ["id", "clinic_id"],
      raw: true,
    });

    if (!treatment) {
      return res.status(404).json({
        status: false,
        message: "Treatment not found.",
        data: [],
      });
    }

    // ✅ Step 2: Fetch the clinic linked to this treatment
    let clinicData = null;
    if (treatment.clinic_id) {
      const clinic = await User.findOne({
        where: { id: treatment.clinic_id },
        attributes: ["id", "clinic_name", "email", "address"],
        raw: true,
      });
      if (clinic) {
        clinicData = {
          id: clinic.id,
          name: clinic.clinic_name,
          email: clinic.email,
          address: clinic.address,
        };
      }
    }

    // ✅ Step 3: Fetch treatment plans for this treatment
    const plans = await TreatmentPlan.findAll({
      where: { treatment_id: client_id },
      include: [
        {
          model: Service,
          as: "category",
          attributes: ["name"],
        },
      ],
      order: [["start_date", "ASC"]],
    });

    const today = moment().startOf("day");

    // ✅ Step 4: Format plans with status, date, and clinic info
    const formattedPlans = plans.map((plan) => {
      const startDate = moment(plan.start_date);
      const endDate =
        plan.end_date && plan.end_date !== "0000-00-00" ? moment(plan.end_date) : null;

      let status = "Upcoming";
      let treatmentDate = startDate;

      if (endDate && today.isAfter(endDate)) {
        status = "Completed";
        treatmentDate = endDate;
      } else if (
        startDate.isSameOrBefore(today) &&
        (!endDate || today.isSameOrBefore(endDate))
      ) {
        status = "Active";
        treatmentDate = endDate || startDate;
      }

      return {
        id: plan.id,
        treatment_status: plan.status,
        treatmentName: plan.category?.name || "N/A",
        image: "",
        status,
        treatmentDate: treatmentDate.format("DD-MM-YYYY"),
        clinic: clinicData,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Past treatment plans fetched successfully!",
      data: formattedPlans,
    });
  } catch (error) {
    console.error("❌ PastTreatmentPlan Fetch Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};


exports.searchClient = async (req, res) => {
  try {
    const { email } = req.body;

    // 🔹 Validate email
    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required.",
      });
    }

    // 🔹 Step 1: Find client by email
    const client = await Client.findOne({
      where: { email },
      attributes: [
        "id",
        "full_name",
        "email",
        "dob",
        "mobile",
        "address",
        "avatar",
        "user_id",
        "created_by",
      ],
    });

    if (!client) {
      return res.status(404).json({
        status: false,
        message: "No client found with this email.",
        data: [],
      });
    }



    // 🔹 Step 2: Check if this client is assigned
    const assigned = await AssignClient.findOne({
      where: { client_id: client.id },
      include: [
        {
          model: User,
          as: "staff", // must match your association alias
          attributes: ["id", "full_name", "email", "mobile", "avatar","created_at"],
        },
      ],
    });
    // 🔹 Step 3: Build response
    let responseData = {
      client,
      assigned: false,
      staff: null,
    };

    if (assigned && assigned.staff) {
      responseData.assigned = true;
      responseData.staff = assigned.staff;
    }

    // 🔹 Step 4: Return result
    return res.status(200).json({
      status: true,
      message: "Client data fetched successfully!",
      data: responseData,
    });

  } catch (error) {
    console.error("❌ SearchClient Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};



exports.SaveOrUpdateClientByStaff = async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  const staffId = decoded.id; // logged-in staff
  const type = 2;

  try {
    let {
      id,
      full_name,
      phone,
      email,
      dob,
      address,
      city,
      state,
      country,
      gender,
      postcode
    } = req.body;

    // ✅ Step 1: Validate required fields
    if (!full_name) return res.status(400).json({ status: false, message: "Full Name is required." });
    if (!phone) return res.status(400).json({ status: false, message: "Phone Number is required." });
    if (!email) return res.status(400).json({ status: false, message: "Email Address is required." });


    // ✅ Step 2: Find clinic (the staff’s creator)
    const staff = await User.findOne({
      where: { id: staffId },
      attributes: ["id", "full_name", "email", "created_by"],
    });

    if (!staff) {
      return res.status(404).json({
        status: false,
        message: "Staff not found or invalid token.",
      });
    }

    const clinic_id = staff.created_by || null;

    // ✅ Step 3: Handle avatar
    const avatar = req.files?.avatar?.[0]?.filename
      ? `/uploads/users/${req.files.avatar[0].filename}`
      : null;

    // ✅ Step 4: Check duplicate client
    const existingUser = await Client.findOne({
      where: {
        [Op.or]: [{ email }, { mobile: phone }],
        ...(id ? { id: { [Op.ne]: id } } : {}),
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Email or phone already exists.",
      });
    }

    // ✅ Step 5: Create new client
    const client = await Client.create({
      avatar,
      full_name,
      email,
      dob,
      mobile: phone,
      address,
      city,
      state,
      country,
      gender,
      postcode,
      created_by: clinic_id,
      user_id: staffId,
    });

    // ✅ Step 6: Assign staff to client
    await AssignClient.create({
      client_id: client.id,
      staff_id: staffId,
      clinic_id,
      type,
      created_at: new Date(),
      updated_at: new Date(),
    });


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

    // ✅ Step 8: Send welcome email to client
    try {
      await transporter.sendMail({
         from: process.env.MAIL_FROM,
        to: client.email,
        subject: "Welcome to ServiceCue!",
        html: `
          <p>Hi ${client.full_name},</p>
          <p>You have been added to <strong>ServiceCue</strong> as a client.</p>
          <p>Please register to access your account and complete your process.</p>
          <br/>
          <p>Thank you,<br/>ServiceCue Team</p>
        `,
      });
      console.log("✅ Welcome email sent to:", client.email);
    } catch (err) {
      console.error("⚠️ Error sending client welcome email:", err);
    }

    // ✅ Step 9: Send notification email to clinic
    if (clinic_id) {
      const clinic = await User.findOne({
        where: { id: clinic_id },
        attributes: ["full_name", "email"],
      });

      if (clinic) {
        try {
          await transporter.sendMail({
             from: process.env.MAIL_FROM,
            to: clinic.email,
            subject: "New Client Added by Staff",
            html: `
              <p>Hi ${clinic.full_name},</p>
              <p>Your staff member <strong>${staff.full_name}</strong> has added a new client:</p>
              <ul>
                <li>Name: ${client.full_name}</li>
                <li>Email: ${client.email}</li>
                <li>Phone: ${client.mobile}</li>
              </ul>
              <br/>
              <p>Best regards,<br/>ServiceCue System</p>
            `,
          });
          console.log("✅ Notification email sent to clinic:", clinic.email);
        } catch (err) {
          console.error("⚠️ Error sending clinic notification email:", err);
        }
      }
    }

    // ✅ Step 10: Send final response
    return res.status(201).json({
      status: true,
      message: "Client added successfully and notifications sent.",
      client,
    });

  } catch (err) {
    console.error("❌ SaveOrUpdateClient Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

exports.assignedclientBystaff = async (req, res) => {
  // 🔹 Step 1: Verify token
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  const staffId = decoded.id; // logged-in staff
  const type = 2;

  try {
    const { client_id } = req.body;

    // ✅ Step 2: Validate input
    if (!client_id) {
      return res.status(400).json({
        status: false,
        message: "Client ID is required.",
      });
    }

    // ✅ Step 3: Find client
    const client = await Client.findOne({
      where: { id: client_id },
      attributes: [
        "id",
        "full_name",
        "email",
        "mobile",
        "created_by", // clinic_id
      ],
    });

    if (!client) {
      return res.status(404).json({
        status: false,
        message: "Client not found.",
      });
    }

    const clinic_id = client.created_by;

    // ✅ Step 4: Check if already assigned
    const alreadyAssigned = await AssignClient.findOne({
      where: { client_id: client.id, staff_id: staffId },
    });

    if (alreadyAssigned) {
      return res.status(400).json({
        status: false,
        message: "This client is already assigned to the staff.",
      });
    }

    // ✅ Step 5: Assign staff to existing client
    await AssignClient.create({
      client_id: client.id,
      staff_id: staffId,
      clinic_id,
      type,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // ✅ Step 6: Setup mail transporter
    // const transporter = nodemailer.createTransport({
    //   host: process.env.MAIL_HOST,
    //   port: process.env.MAIL_PORT,
    //   secure: false,
    //   auth: {
    //     user: process.env.MAIL_USER,
    //     pass: process.env.MAIL_PASS,
    //   },
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

    // ✅ Step 7: Send email to client (informing assignment)
    try {
      await transporter.sendMail({
         from: process.env.MAIL_FROM,
        to: client.email,
        subject: "You Have Been Assigned to a Staff Member",
        html: `
          <p>Hi ${client.full_name},</p>
          <p>You have been assigned to a staff member at <strong>ServiceCue</strong>.</p>
          <p>Your staff will help manage your treatments and appointments.</p>
          <br/>
          <p>Thank you,<br/>ServiceCue Team</p>
        `,
      });
      console.log("✅ Assignment email sent to client:", client.email);
    } catch (err) {
      console.error("⚠️ Error sending email to client:", err);
    }

    // ✅ Step 8: Send notification to clinic
    if (clinic_id) {
      const clinic = await User.findOne({
        where: { id: clinic_id },
        attributes: ["full_name", "email"],
      });

      const staff = await User.findOne({
        where: { id: staffId },
        attributes: ["full_name", "email"],
      });

      if (clinic) {
        try {
          await transporter.sendMail({
             from: process.env.MAIL_FROM,
            to: clinic.email,
            subject: "New Client Assigned by Staff",
            html: `
              <p>Hi ${clinic.full_name},</p>
              <p>Your staff member <strong>${staff.full_name}</strong> has assigned a new client:</p>
              <ul>
                <li>Name: ${client.full_name}</li>
                <li>Email: ${client.email}</li>
                <li>Phone: ${client.mobile}</li>
              </ul>
              <br/>
              <p>Best regards,<br/>ServiceCue System</p>
            `,
          });
          console.log("✅ Notification email sent to clinic:", clinic.email);
        } catch (err) {
          console.error("⚠️ Error sending clinic email:", err);
        }
      }
    }

    // ✅ Step 9: Response
    return res.status(200).json({
      status: true,
      message: "Client assigned successfully, and notifications sent.",
      data: client,
    });

  } catch (err) {
    console.error("❌ assignedclientBystaff Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};





