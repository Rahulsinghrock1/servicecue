require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Progress = require('@models/Progress');
const nodemailer = require('nodemailer');
const uploadProfilePic = require("@helpers/imageUpload");
const { getUserDetails } = require('@helpers/commonHelper');
const Clinic = require('@models/Clinic');
const AssignClient = require('@models/AssignClient');
const ClinicReview = require('@models/Reviews');
const User = require('@models/User');
const Client = require('@models/Client');
const TreatmentPlan  = require('@models/TreatmentPlan');
const Service  = require('@models/Service');
const { Sequelize } = require("sequelize"); // upar import hona chahiye
const moment = require("moment"); // for date comparison
const { Op } = require("sequelize");
const ProgressImage = require('@models/ProgressImage');
const ProgressComments = require('@models/ProgressComments');
const Goal = require('@models/Goal');
const TreatmentProducts = require('@models/TreatmentProducts');
const Products = require('@models/Products');
const ProductImages = require('@models/ProductImages');
const CategoryModel  = require('@models/Category');
const ClinicServices = require("@models/ClinicServices");
const ProductPrescriptions = require("@models/ProductPrescriptions");
const ClinicFollow = require('@models/ClinicFollow');
const Treatment = require('@models/Treatment');
const TreatmentProductsHistory = require('@models/TreatmentProductsHistory');
const TreatmentProductsRepurchase = require('@models/TreatmentProductsRepurchase');
const admin = require("@config/firebase");


const now = new Date();


function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function shouldShowReminder(frequency, startDate, today) {
  if (!frequency) return [];

  // Normalize frequency string
  const freq = frequency.trim().replace(/–/g, "-");
  const reminderTimes = [];

  const dayDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  const currentHour = today.getHours(); // 0-23

  switch (freq) {
    case "Morning Only (AM)":
      if (currentHour >= 6 && currentHour < 12) reminderTimes.push("Morning");
      break;
    case "Evening Only (PM)":
      if (currentHour >= 12 && currentHour < 18) reminderTimes.push("Evening");
      break;
    case "Morning & Evening (AM + PM)":
      if (currentHour >= 6 && currentHour < 12) reminderTimes.push("Morning");
      if (currentHour >= 12 && currentHour < 18) reminderTimes.push("Evening");
      break;
    case "Every 2nd Day":
      if (dayDiff % 2 === 0) reminderTimes.push("Morning");
      break;
    case "2-3 Times Weekly":
      if (dayDiff % 3 === 0) reminderTimes.push("Morning");
      break;
    default:
      console.log("No matching frequency case for:", freq);
  }

  return reminderTimes;
}

function getTimesPerDay(frequencyLabel) {
  switch (frequencyLabel) {
    case "Morning Only (AM)":
    case "Evening Only (PM)":
      return 1;
    case "Morning & Evening (AM + PM)":
      return 2;
    case "Every 2nd Day":
      return 0.5; // every other day
    case "2–3 Times Weekly":
      return 0.4; // roughly 2.8 times per week
    default:
      return 1;
  }
}

function calculateTotalSessions(productPrescriptions) {
  let total = 0;

  for (const item of productPrescriptions) {
    if (!item.start_time || !item.end_time) continue; // skip invalid records

    const start = new Date(item.start_time);
    const end = new Date(item.end_time);

    // Difference in days (inclusive)
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const timesPerDay = getTimesPerDay(item.frequency);

    const totalForThis = diffDays * timesPerDay;
    total += totalForThis;
  }

  return total;
}


exports.AssignClient = async (req, res) => {
  try {
    const loginUserId = req.user.id;

    // 1. TreatmentPlan se saare client_ids nikal lo
    const treatmentPlans = await Treatment.findAll({
      attributes: ['client_id'],
      raw: true, // sirf plain objects milein
    });

    // client_ids ka array banalo
    const treatedClientIds = treatmentPlans.map(tp => tp.client_id);

    const assignedClients = await Client.findAll({
  where: {
    id: {
      [Op.in]: treatedClientIds,
    },
  },
  attributes: ['id'], // Add other fields if needed
  raw: true,
});

// Step 3: Extract just the IDs (if needed)
const assignedClientIds = assignedClients.map(client => client.id);

// Step 2: Get clients not in assigned list
const list = await AssignClient.findAll({
  where: {
    staff_id: loginUserId,
    client_id: {
      [Op.notIn]: assignedClientIds.length > 0 ? assignedClientIds : [0],
    },
  },
  include: [
    {
      model: Client,
      as: "assignedClient", // make sure this alias matches your model definition
      attributes: ["id", "full_name", "email", "dob", "gender", "mobile", "avatar", "user_id"],
    },
  ],
  order: [["created_at", "DESC"]],
});

    const formattedList = list.map(item => ({
      id: item.id,
      staff_id: item.staff_id,
      client_id: item.assignedClient.id,
      clinic_id: item.clinic_id,
      createdAt: item.createdAt,
      notes: item.notes,
      client: item.assignedClient,
    }));

    return res.status(200).json({
      message: "List fetched successfully!",
      data: formattedList,
    });
  } catch (error) {
    console.error("❌ Error fetching assigned clients:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};



exports.Clients = async (req, res) => {
  try {
    const { type } = req.body;

    if (![1, 2].includes(Number(type))) {
      return res.status(400).json({
        message: "Invalid type (must be 1 for active, 2 for inactive).",
        data: [],
      });
    }

    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const loginUserId = decoded.id;
    // Step 1: Fetch treatments for this staff with status
    const treatments = await Treatment.findAll({
      where: {
        created_by: loginUserId,
        status: Number(type) === 1 ? 1 : { [Op.ne]: 1 },
      },
      attributes: ["id", "client_id"],
      raw: true,
    });

    if (!treatments.length) {
      return res.status(200).json({
        message: "No treatments found for this type.",
        data: [],
      });
    }

    const treatmentMap = new Map(); // client_user_id -> treatment_ids[]
    treatments.forEach(t => {
      if (!treatmentMap.has(t.client_id)) {
        treatmentMap.set(t.client_id, []);
      }
      treatmentMap.get(t.client_id).push(t.id);
    });

    const clientUserIds = [...treatmentMap.keys()];

    // Step 2: Get mapped Client.id from Client.user_id
    const clients = await Client.findAll({
      where: { id: clientUserIds },
      attributes: ["id", "user_id"],
      raw: true,
    });






    const userIdToClientId = {};
    clients.forEach(c => {
      userIdToClientId[c.user_id] = c.id;
    });

    const clientIds = Object.values(userIdToClientId);


    // Step 3: Get AssignClient data (client assigned to this staff)
    const assignList = await AssignClient.findAll({
      where: {
        staff_id: loginUserId,
        client_id: { [Op.in]: clientIds },
      },
      include: [
        {
          model: Client,
          as: "assignedClient",
          attributes: [
            "id",
            "full_name",
            "email",
            "dob",
            "gender",
            "mobile",
            "avatar",
            "user_id"
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Step 4: Build final formatted response
  const formattedList = await Promise.all(assignList.map(async (item) => {
  const client = item.assignedClient;
  if (!client) return null;

  const clientUserId = client.id;
  const clientTreatmentIds = treatmentMap.get(clientUserId) || [];

  if (!clientTreatmentIds.length) return null;

  // Since only one active/inactive treatment per client expected, pick first:
  const treatmentId = clientTreatmentIds[0]; 

  // Total treatments count for this client (all status)
  const totalTreatments = await TreatmentPlan.count({
    where: {  treatment_id: treatmentId },
  });






  // Completed treatments count for this client (end_date in past)
const completedTreatments = await TreatmentPlan.count({
  where: {
    treatment_id: treatmentId,
    status: 1, // ✅ sirf wahi record jinka status = 1 hai
    end_date: { [Op.lte]: Sequelize.fn("CURDATE") }, // ✅ jinka end_date aaj se pehle ya barabar hai
  },
});

  // Goals for this treatment
  const goals = await Goal.findAll({
    where: { treatment_id: treatmentId },
    attributes: ["status"],
    raw: true,
  });

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 1 || g.status === '1' || g.status === 'completed').length;

  // Products count for this treatment
  const totalProducts = await TreatmentProducts.count({
    where: { treatment_id: treatmentId },
  });




  return {
    id: item.id,
    staff_id: item.staff_id,
    client_id: item.client_id,
    clinic_id: item.clinic_id,
    createdAt: item.createdAt,
    notes: item.notes,
    totaltreatments: `${completedTreatments}/${totalTreatments}`,
    totalproduct: `${totalProducts}`,
    totalgoals: `${completedGoals}/${totalGoals}`,
    treatment_id: treatmentId,  // Single treatment id here
    client: {
      id: client.id,
      full_name: client.full_name,
      email: client.email,
      dob: client.dob,
      gender: client.gender,
      mobile: client.mobile,
      avatar: client.avatar,
    },
  };
}));



    return res.status(200).json({
      message: "Clients fetched successfully based on treatment status.",
      data: formattedList.filter(Boolean),
    });

  } catch (error) {
    console.error("❌ Error fetching clients:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};


exports.clientDetails = async (req, res) => {
  try {
    const { id } = req.params; // assign_clients ka id
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const loginUserId = decoded.id;
    // ✅ Step 1: AssignClient record fetch karo
    const assigned = await AssignClient.findOne({
      where: { id: id, staff_id: loginUserId },
      attributes: [
        "client_id",
        "notes",
        [Sequelize.col("created_at"), "assign_date"], // alias properly
      ],
    });
    if (!assigned) {
      return res.status(403).json({
        status: false,
        message: "You are not authorized to view this client.",
      });
    }

    // ✅ Step 2: Client details fetch karo
    const client = await Client.findOne({
      where: { id: assigned.client_id },
      attributes: [
        "id",
        "full_name",
        "email",
        "dob",
        "gender",
        "mobile",
        "avatar",
        "address",
        "city",
        "state",
        "country",
      ],
    });

    if (!client) {
      return res.status(404).json({
        status: false,
        message: "Client not found!",
      });
    }

    // ✅ Step 3: Merge response
    const responseData = {
      ...client.toJSON(),
      notes: assigned.notes || "",
      assign_date: assigned.get("assign_date"), // use alias ka value
    };

    return res.status(200).json({
      status: true,
      message: "Client details fetched successfully!",
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Error fetching client details:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};





exports.createOrUpdateTreatmentPlan = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const loginUserId = decoded.id;

    // ✅ Handle file upload
    await new Promise((resolve, reject) => {
      uploadProfilePic(req, res, (err) => (err ? reject(err) : resolve()));
    });

    const {
      edit_id, // ✅ coming from frontend when editing
      client_id,
      clinic_id,
      goals,
      concerns,
      service_categories,
      products,
      price,
      additional_notes, 
    } = req.body || {};

    if (!client_id || !clinic_id) {
      return res.status(400).json({
        status: false,
        message: "Client & Clinic ID required",
      });
    }

    // ✅ Uploaded images
    const front = req.files?.front ? `/uploads/clinic_images/${req.files.front[0].filename}` : null;
    const left = req.files?.left ? `/uploads/clinic_images/${req.files.left[0].filename}` : null;
    const right = req.files?.right ? `/uploads/clinic_images/${req.files.right[0].filename}` : null;

    // ✅ Normalize fields
    const concernsNorm = Array.isArray(concerns) ? concerns.join(",") : concerns;
    const serviceCategoriesNorm = Array.isArray(service_categories)
      ? service_categories.join(",")
      : service_categories;

    const goalsArray = Array.isArray(goals)
      ? goals
      : typeof goals === "string"
      ? goals.split(",").map((g) => g.trim())
      : [];

    const productsArray = Array.isArray(products)
      ? products
      : typeof products === "string"
      ? products.split(",").map((p) => p.trim())
      : [];

    const formatDate = (date) => {
      if (!date) return null;
      return moment(date, ["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD");
    };

    // ✅ Parse treatments array
    let treatments = [];
    if (typeof req.body?.treatments === "string") {
      try {
        const parsed = JSON.parse(req.body.treatments);
        if (Array.isArray(parsed)) treatments = parsed;
      } catch (e) {
        console.error("❌ treatments JSON parse failed:", e.message);
      }
    }

    Object.keys(req.body || {}).forEach((key) => {
      const match = key.match(/^treatments\[(\d+)\]\[(.+)\]$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        if (!treatments[index]) treatments[index] = {};
        treatments[index][field] = req.body[key];
      }
    });

    if (Array.isArray(req.body?.treatments) && req.body.treatments.length) {
      treatments = req.body.treatments;
    }

    treatments = (treatments || []).filter(
      (t) => t && t.cat_id && t.start_date && t.end_date
    );

    if (!treatments.length) {
      return res.status(400).json({
        status: false,
        message: "At least one valid treatment plan is required",
      });
    }

    // -----------------------------------------------------
    // 💾 Step 1: Create OR Update Main Treatment
    // -----------------------------------------------------
    let mainTreatment;

    if (edit_id) {
      // ✅ Update existing treatment
      mainTreatment = await Treatment.findByPk(edit_id);
      if (!mainTreatment) {
        return res.status(404).json({
          status: false,
          message: "Treatment not found for editing",
        });
      }

      await mainTreatment.update({
        client_id,
        clinic_id,
        concerns: concernsNorm,
        front: front || mainTreatment.front,
        left: left || mainTreatment.left,
        right: right || mainTreatment.right,
        price,
        additional_notes,
        updated_by: loginUserId,
      });

      const treatment = await Treatment.findOne({
      where: { id: edit_id },
      attributes: ["id", "client_id", "created_by"], // created_by is staff_id
    });

    if (!treatment) {
      return res.status(404).json({
        status: false,
        message: "Treatment record not found.",
      });
    }

    // ✅ 4. Get client details
    const clientDetails = await Client.findOne({
      where: { id: treatment.client_id },
      attributes: ["id", "user_id"],
    });

    // 🔒 Notification tabhi bhejna hai jab client details milti hain
    if (clientDetails) {
      // ✅ 5. Get client’s assigned user (treatment creator)
      const treatmentCreator = await User.findOne({
        where: { id: clientDetails.user_id },
        attributes: ["id", "full_name", "push_token"],
      });

      // ✅ 6. Get staff (created_by)
      const staffUser = await User.findOne({
        where: { id: treatment.created_by },
        attributes: ["id", "full_name"],
      });

      // ✅ 7. Prepare & send notification
      if (treatmentCreator && treatmentCreator.push_token) {
        const message = {
          token: treatmentCreator.push_token,
          notification: {
            title: "Treatment Update",
            body: `${staffUser.full_name} has update the Treatment.`,
          },
          data: {
            type: "Treatment Update",
            id: edit_id.toString(),
            goal_id: edit_id.toString(),
          },
        };

        try {
          await admin.messaging().send(message);
          console.log("✅ Firebase notification sent successfully");
        } catch (fcmError) {
          console.error("❌ Firebase notification error:", fcmError);
        }
      }
    }
    } else {
      // ✅ Create new treatment
      mainTreatment = await Treatment.create({
        client_id,
        clinic_id,
        concerns: concernsNorm,
        front,
        left,
        right,
        price,
        additional_notes,
        created_by: loginUserId,
      });
    }

    // ✅ Link last prescription to treatment
const lastPrescription = await ProductPrescriptions.findOne({
  order: [['id', 'DESC']], // ✅ get the latest entry
});

if (lastPrescription) {
  await lastPrescription.update({
    treatment_id: mainTreatment.id, // link new treatment
    // add any other fields to update
  });
}

    // -----------------------------------------------------
    // 💾 Step 2: Create or Update Treatment Plans
    // -----------------------------------------------------
    const treatmentPlanResults = [];

    for (const t of treatments) {
      const planData = {
        client_id,
        clinic_id,
        concerns: concernsNorm,
        service_categories: serviceCategoriesNorm,
        products: productsArray.join(","),
        cat_id: t.cat_id,
        start_date: formatDate(t.start_date),
        end_date: formatDate(t.end_date),
        front: front || mainTreatment.front,
        left: left || mainTreatment.left,
        right: right || mainTreatment.right,
        price:t.price,
        treatment_id: mainTreatment.id,
        created_by: loginUserId,
      };

      let treatmentPlan;
      if (t.id) {
        await TreatmentPlan.update(planData, { where: { id: t.id } });
        treatmentPlan = await TreatmentPlan.findByPk(t.id);
      } else {

        console.log(planData);
        treatmentPlan = await TreatmentPlan.create(planData);
      }

      treatmentPlanResults.push(treatmentPlan);
    }

    // -----------------------------------------------------
    // 💾 Step 3: Save Goals
    // -----------------------------------------------------
    if (goalsArray.length) {
      await Goal.destroy({ where: { treatment_id: mainTreatment.id } });
      const goalRows = goalsArray.map((g) => ({
        treatment_id: mainTreatment.id,
        client_id,
        staff_id: loginUserId,
        name: g,
        status: 0,
      }));
      await Goal.bulkCreate(goalRows);
    }

    // -----------------------------------------------------
    // 💾 Step 4: Save Products
    // -----------------------------------------------------
    if (productsArray.length) {
      await TreatmentProducts.destroy({ where: { treatment_id: mainTreatment.id } });
      const productRows = productsArray.map((p) => ({
        treatment_id: mainTreatment.id,
        client_id,
        staff_id: loginUserId,
        product_id: p,
        status: 1,
      }));
      await TreatmentProducts.bulkCreate(productRows);
    }

    // -----------------------------------------------------
    // ✅ Final Response
    // -----------------------------------------------------
    return res.status(201).json({
      status: true,
      message: edit_id
        ? "Treatment updated successfully"
        : "Treatment, plans, goals & products saved successfully",
      treatment_id: mainTreatment.id,
      plans_created: treatmentPlanResults.length,
    });
  } catch (err) {
    console.error("❌ Error in createOrUpdateTreatmentPlan:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};


exports.deleteTreatmentPlan = async (req, res) => {
  try {
    const { id } = req.params; // treatment plan id from URL

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Treatment Plan ID is required"
      });
    }

    // find treatment
    const treatment = await TreatmentPlan.findByPk(id);

    if (!treatment) {
      return res.status(404).json({
        status: false,
        message: "Treatment Plan not found"
      });
    }

    // soft delete
    await treatment.destroy();

    return res.status(200).json({
      status: true,
      message: "Treatment Plan deleted successfully"
    });

  } catch (error) {
    console.error("❌ Delete Treatment Plan Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};




exports.TreatmentPlan = async (req, res) => {
  try {
    
    //     const token = req.header("Authorization")?.replace("Bearer ", "");
    // if (!token) {
    //   return res.status(401).json({ message: "Authentication token is required." });
    // }

    // const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    // const client_id = decoded.id;




const token = req.header("Authorization")?.replace("Bearer ", "");
if (!token) {
return res.status(401).json({ message: "Authentication token is required." });
}

const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
const loginUserId = decoded.id;

const user = await User.findOne({
where: { id: loginUserId },
attributes: ["id", "user_role_id"], // select whatever fields you need
raw: true
});







let clientIds = []; // declare outside if/else

if (user.user_role_id === 1) {
  const client_id = user.id;

  const clients = await Client.findAll({
    where: { user_id: client_id }, // filter by user_id
    attributes: ['id'],            // only id
    raw: true
  });

  clientIds = clients.map(c => c.id);

} else {
  const client_id = req.body.client_id;
  if (!client_id) {
    return res.status(400).json({ message: "client_id is required in request body." });
  }

  const clients = await Client.findAll({
    where: { id: client_id }, // filter by client.id
    attributes: ['id'],
    raw: true
  });

  clientIds = clients.map(c => c.id);
}

// ✅ clientIds is now defined
const treatments = await Treatment.findAll({
  where: { client_id: clientIds },
  attributes: ["id", "clinic_id"],
  raw: true,
});

if (!treatments || treatments.length === 0) {
  return res.status(404).json({
    status: false,
    message: "No treatments found for this client.",
    data: [],
  });
}


    const treatmentIds = treatments.map((t) => t.id);
    const clinicIds = [...new Set(treatments.map((t) => t.clinic_id).filter(Boolean))];

    // ✅ Step 2: Fetch clinic data in bulk
    let clinics = [];
    if (clinicIds.length > 0) {
      clinics = await User.findAll({
        where: { id: clinicIds },
        attributes: ["id", "clinic_name", "email","address"],
        raw: true,
      });
    }

    // ✅ Step 3: Fetch treatment plans using treatment IDs
    const plans = await TreatmentPlan.findAll({
      where: { treatment_id: treatmentIds },
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

    // ✅ Step 4: Format plans with status, date, and clinic name
    const formattedPlans = plans.map((plan) => {
      const startDate = moment(plan.start_date);
      const endDate =
        plan.end_date && plan.end_date !== "0000-00-00" ? moment(plan.end_date) : null;

let status;
let treatmentDate;

if (plan.status === false) {
  treatmentDate = startDate;

  if (endDate && today.isAfter(endDate)) {
    status = "Completed";
    treatmentDate = endDate;
  } else if (startDate.isSameOrBefore(today) && (!endDate || today.isSameOrBefore(endDate))) {
    status = "Active";
    treatmentDate = endDate || startDate;
  } else {
    status = "Upcoming"; // fallback if today is before startDate
  }

} else {
  status = "Completed";
  treatmentDate = endDate || startDate; // you can choose which date makes sense here
}



      // 👇 Find the clinic linked to this treatment
      const treatment = treatments.find((t) => t.id === plan.treatment_id);
      const clinicData = clinics.find((c) => c.id === treatment?.clinic_id);

      return {
        id: plan.id,
        treatmentId: plan.treatment_id,
        treatment_status: plan.status,
        treatmentName: plan.category?.name || "N/A",
        image: "",
        status,
        treatmentDate: treatmentDate.format("DD-MM-YYYY"),
        clinic: clinicData
          ? {
              id: clinicData.id,
              name: clinicData.clinic_name,
              email: clinicData.email,
              address: clinicData.address,
            }
          : null,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Treatment plans fetched successfully!",
      data: formattedPlans,
    });
  } catch (error) {
    console.error("❌ TreatmentPlan Fetch Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};


exports.PreviousTreatmentPlan = async (req, res) => {
  try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token is required." });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    // In your login code, you signed token with { userId: user.id }
    const client_id = decoded.id;
    if (!client_id) {
      return res.status(400).json({
        status: false,
        message: "client_id is required.",
      });
    }
    const clients = await Client.findAll({
  where: { user_id: client_id }, // yahan user_id aapka filter hoga
  attributes: ['id'],          // sirf id chahiye
  raw: true
});
// agar aapko sirf id ka array chahiye:
const clientIds = clients.map(c => c.id);

    // ✅ Step 1: Get all treatments for this client
    const treatments = await Treatment.findAll({
       where: { client_id: clientIds },
      attributes: ["id", "clinic_id", "status"],
      raw: true,
    });

    if (!treatments || treatments.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No treatments found for this client.",
        data: [],
      });
    }

    const treatmentIds = treatments.map((t) => t.id);

    // ✅ Step 2: Get all treatment plans
    const plans = await TreatmentPlan.findAll({
      where: { treatment_id: treatmentIds },
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

    // ✅ Step 3: Format plans with status
    const formattedPlans = plans.map((plan) => {
      const startDate = moment(plan.start_date);
      const endDate =
        plan.end_date && plan.end_date !== "0000-00-00"
          ? moment(plan.end_date)
          : null;

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
        treatmentId: plan.treatment_id,
        treatmentName: plan.category?.name || "N/A",
        image: "",
        status,
        treatmentDate: treatmentDate.format("DD-MM-YYYY"),
      };
    });

    // ✅ Step 4: Fetch clinic data in bulk (⚡ without raw: true to use model getters)
    const clinicIds = [
      ...new Set(treatments.map((t) => t.clinic_id).filter(Boolean)),
    ];

    let clinics = [];
    if (clinicIds.length > 0) {
      const clinicRecords = await User.findAll({
        where: { id: clinicIds },
        attributes: ["id", "clinic_name", "email", "address", "clinicLogo"],
      });

      // convert to plain objects so JSON stringify works properly
      clinics = clinicRecords.map((c) => c.get({ plain: true }));
    }

    // ✅ Step 5: Fetch treatment goals in bulk
    const goals = await Goal.findAll({
      where: { treatment_id: treatmentIds },
      attributes: ["id", "treatment_id", "name", "status"],
      raw: true,
    });

    // ✅ Step 6: Group data by treatment
    const groupedData = treatments.map((t) => {
      const treatmentPlans = formattedPlans.filter(
        (p) => p.treatmentId === t.id
      );
      const treatmentGoals = goals.filter((g) => g.treatment_id === t.id);
      const clinicData = clinics.find((c) => c.id === t.clinic_id);

      return {
        treatment_id: t.id,
        treatment_status: t.status,
        clinic_id: t.clinic_id,
        clinic: clinicData || null,
        plans: treatmentPlans,
        goals: treatmentGoals,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Previous treatment plans fetched successfully!",
      data: groupedData,
    });
  } catch (error) {
    console.error("❌ PreviousTreatmentPlan Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};





exports.clientTreatmentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const loginUserId = decoded.id;

    // ✅ Step 1: Fetch treatment details
    const treatment = await Treatment.findOne({
      where: { id: id },
      attributes: ["id", "client_id", "front", "left", "right", "concerns","price","clinic_id","additional_notes","created_at"],
      raw: true,
    });

    if (!treatment) {
      return res.status(404).json({ message: "Treatment not found" });
    }

    const clientUserId = treatment.client_id;

    // ✅ Step 2: Fetch client
const client = await Client.findOne({
  where: { id: clientUserId },
  attributes: [
    "id", "full_name", "email", "dob", "gender", "mobile",
    "avatar", "address", "city", "state", "country", "user_id"
  ],
});



    if (!client) {
      return res.status(404).json({
        status: false,
        message: "Client not found!",
      });
    }

    // ✅ Step 3: Treatment plan count
    const totalTreatments = await TreatmentPlan.count({
      where: { treatment_id: id }
    });

    // ✅ Step 4: Assigned client check
    const assigned = await AssignClient.findOne({
      where: { client_id: client.id },
      attributes: ["client_id", "notes", [Sequelize.col("created_at"), "assign_date"]],
    });

    if (!assigned) {
      return res.status(403).json({
        status: false,
        message: "You are not authorized to view this client.",
      });
    }

    if (client) {
  // Overwrite `id` with value of `user_id`
  client.setDataValue('id', client.id);
}

    // ✅ Helpers
    function formatDate(dateInput) {
      const date = new Date(dateInput);
      if (!dateInput || isNaN(date.getTime())) return 'Invalid Date';
      return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
    }

    function getWeekDifference(fromDate, toDate) {
      const diffMs = new Date(toDate) - new Date(fromDate);
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return Math.floor(diffDays / 7);
    }

    // ✅ Step 5: Goals
    const goalsArray = await Goal.findAll({
      where: { treatment_id: id },
      attributes: ["id", "name", "status"],
    });
    const totalGoals = goalsArray.length;
    const completedGoals = totalGoals > 0 ? totalGoals - 1 : 0; // placeholder

    // ✅ Step 6: Concerns
    const concernsList = treatment.concerns ? treatment.concerns.split(",") : [];

    // ✅ Step 7: Before images
const treatmentImages = ["front", "left", "right"]
  .map((key) => {
    if (treatment[key]) {
      return {
        key,
        image_url: `${process.env.BASE_PATH}${treatment[key]}`,
      };
    }
    return null; // skip if no image
  })
  .filter(Boolean); // remove nulls

    // ✅ Step 8: Progress history
    const progressEntries = await Progress.findAll({
      where: { treatment_id: treatment.id },
      order: [["created_at", "ASC"]],
      include: [
        {
          model: ProgressImage,
          as: "images",
          attributes: ["image"]
        },
        {
          model: ProgressComments,
          as: "comments",
          attributes: ["id", "comments", "user_id", "created_at"]
        },
        {
          model: User,
          as: "user",
          attributes: ["full_name", "avatar"]
        }
      ]
    });

    const baseDate = progressEntries.length ? new Date(treatment.created_at) : null;
const progressHistory = progressEntries.map((entry, index) => {
  const entryDate = new Date(entry.createdAt);
  const weekDiff = baseDate ? getWeekDifference(baseDate, entryDate) : 0;

return {
  progress_id: entry.id,
  treatment_id: entry.treatment_id,
  user_name: entry.user?.full_name || "Unknown",
  avatar: entry.user?.avatar || null,
  treatment_date: formatDate(entry.createdAt),
  difference_from_first_entry: `Photos after ${weekDiff} week${weekDiff !== 1 ? "s" : ""}`,
  images: entry.images.map((img) => ({
    image_url: img.image,
  })),
};
});

const today = new Date();

const treatmentPlanService = await TreatmentPlan.findAll({
  where: {
    start_date: {
      [Op.gte]: today,
    },
  },
  attributes: ["id", "cat_id", "start_date", "end_date", "price"], // no treatment_id needed here
  raw: true,
});

// Enrich each plan: set treatment_id = id, and fetch category_id
const enrichedPlans = await Promise.all(
  treatmentPlanService.map(async (plan) => {
    const service = await Service.findOne({
      where: { id: plan.cat_id },
      attributes: ["category_id"],
      raw: true,
    });

    return {
      ...plan,
      treatment_id: plan.id, // ✅ set treatment_id equal to id
      category_id: service ? service.category_id : null,
    };
  })
);
const treatmentProductIds = await TreatmentProducts.findAll({
  where: { treatment_id: id },
  attributes: ["product_id"],
  raw: true,
});



// Extract product_ids
const treatmentIds = treatmentProductIds.map(tp => tp.product_id);

// 🧩 Step 2: Get prescriptions for this treatment
const productPrescriptions = await ProductPrescriptions.findAll({
  where: { treatment_id: id },
  attributes: [
    "id",
    "treatment_id",
    "product_id",
    "dosage",
    "duration",
    "start_time",
    "end_time",
    "time_option",
    "intake_mode",
    "frequency",
  ],
  raw: true,
});

// 🧠 Step 3: Merge product IDs from both sources (treatmentProducts + prescriptions)
const allProductIds = [
  ...new Set([
    ...treatmentIds,
    ...productPrescriptions.map(p => p.product_id).filter(Boolean),
  ]),
];

// 🧩 Step 4: Fetch from Products table (with image)
const products = await Products.findAll({
  where: { id: allProductIds },
  attributes: ["id", "title", "dosage","frequency","time_option","duration"],
  include: [
    {
      model: ProductImages,
      as: "images",
      attributes: ["image_url"],
      limit: 1,
    },
  ],
  raw: false,
});


// 🧩 Step 5: Create a map for quick lookup by product_id
const productsMap = {};
products.forEach(p => {
  productsMap[p.id] = {
    id: p.id,
    title: p.title || "N/A",
    dosage: p.dosage || "",
    frequency: p.frequency || "",
     intake_mode: p.intake_mode || "",
     time_option: p.time_option || "",
    image: (p.images && p.images.length > 0)
      ? p.images[0].image_url
      : "http://localhost:5000/api/uploads/products/no-image.jpg",
  };
});

// 🧩 Step 6: Merge data — always take title & image from Products table
let productsArray = [];

if (productPrescriptions.length > 0) {
  productsArray = productPrescriptions.map(pres => {
    const productFromTable = productsMap[pres.product_id];
    if (!productFromTable) {
      console.log("⚠️ Missing product for ID:", pres.product_id);
    }

    return {
      id: pres.product_id || null,
      title: productFromTable?.title || "N/A", // Always from product table
      dosage: pres.dosage || productFromTable?.dosage || "N/A",
      image: productFromTable?.image || "http://localhost:5000/api/uploads/products/no-image.jpg",
      duration: pres.duration || "",
      start_time: pres.start_time || "",
      end_time: pres.end_time || "",
      time_option: pres.time_option || "",
      intake_mode: pres.intake_mode || "",
      frequency: pres.frequency || productFromTable?.frequency || "N/A",
    };
  });
} else {
  // 🧩 No prescriptions → show all product table data
  productsArray = Object.values(productsMap);
}

    const used = Math.floor(productsArray.length * 0.7);
    const percent = productsArray.length > 0 ? Math.round((used / productsArray.length) * 100) : 0;
    const totalProductPercent = `${percent}%`;


    const completedTreatments = await TreatmentPlan.count({
  where: {
    treatment_id: id,
    status: 1, // ✅ sirf wahi record jinka status = 1 hai
    end_date: { [Op.lte]: Sequelize.fn("CURDATE") }, // ✅ jinka end_date aaj se pehle ya barabar hai
  },
});
  // Goals for this treatment
  const goals = await Goal.findAll({
    where: { treatment_id: id },
    attributes: ["status"],
    raw: true,
  });
  const totalGoalss = goals.length;
  const completedGoalss = goals.filter(g => g.status === 1 || g.status === '1' || g.status === 'completed').length;
    // ✅ Step 11: Build final response
    const responseData = {
      ...client.toJSON(),
      notes: assigned.notes || "",
      assign_date: assigned.get("assign_date"),
      treatment_stats: {
        totaltreatments: `${completedTreatments}/${totalTreatments}`,
        totalproduct: productsArray.length,
        totalproduct_percent: `${totalProductPercent}`,
           totalgoals: `${completedGoalss}/${totalGoalss}`,
        concerns: concernsList,
        goals: goalsArray,
        products: productsArray,
        treatmentPlan: enrichedPlans,
        before_images: treatmentImages,
      },
      treatment_id: id,
      additional_notes: treatment.additional_notes,
      clinic_id: treatment.clinic_id,
      treatment_price: treatment.price,
      progress_history: progressHistory
    };

    return res.status(200).json({
      status: true,
      message: "Client details fetched successfully!",
      data: responseData,
    });

  } catch (error) {
    console.error("❌ Error fetching client details:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};


exports.clientTreatmentgoal = async (req, res) => {

  try {
    const { id: treatmentId } = req.params;

    // 📌 Get treatment
    const treatment = await Treatment.findOne({
      where: { id: treatmentId },
      attributes: ["id", "client_id", "concerns", "front", "left", "right","status","createdAt"],
    });

    if (!treatment) {
      return res.status(404).json({
        status: false,
        message: "Treatment not found!",
      });
    }

    // 📌 Get client
    const client = await Client.findOne({
      where: { id: treatment.client_id },
      attributes: ["id", "full_name", "email", "dob", "gender", "mobile", "avatar", "address", "city", "state", "country"],
    });

    if (!client) {
      return res.status(404).json({
        status: false,
        message: "Client not found!",
      });
    }

    // 🧭 Dynamic Base URL
    const baseUrl = process.env.BASE_PATH?.endsWith("/")
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.NEXT_PUBLIC_APP_URL + "/";

    const getFullImagePath = (path, fallback) => {
      if (!path) return baseUrl + fallback;
      return path.startsWith("http") ? path : baseUrl + path;
    };

    // 🧾 Goals
 const goalsArray = await Goal.findAll({
  where: { treatment_id: treatment.id },
  attributes: ["id", "name", "status"],
  raw: true,
});

// Convert 0/1 to false/true
const formattedGoals = goalsArray.map(goal => ({
  ...goal,
  status: !!goal.status  // 0 => false, 1 => true
}));

    // Calculate goal stats
    const totalGoals = goalsArray.length;
    const completedGoals = goalsArray.filter((g) => g.status === "completed").length;

    // 📊 Treatment stats
    const totalTreatments = await Treatment.count({ where: { client_id: treatment.client_id } });
    const completedTreatments = await Treatment.count({
      where: {
        client_id: treatment.client_id,
        status: "completed", // assuming your treatment.status has "completed" value
      },
    });

    // 📸 Before Images
    const treatmentImages = [
      { image_url: getFullImagePath(treatment.front, "uploads/treatments/no-image.jpg") },
      { image_url: getFullImagePath(treatment.left, "uploads/treatments/no-image.jpg") },
      { image_url: getFullImagePath(treatment.right, "uploads/treatments/no-image.jpg") },
    ];

    // 📤 Final Response
    const responseData = {
      treatment_stats: {
        totaltreatments: `${completedTreatments}/${totalTreatments}`,
        totalgoals: `${completedGoals}/${totalGoals}`,
        goals: formattedGoals,
        before_images: treatmentImages,
      },
      treatment_id: treatment.id,
 treatment_status: treatment.status === "0" ? true : false,
    };

    return res.status(200).json({
      status: true,
      message: "Treatment details fetched successfully!",
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Error fetching treatment details:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};





exports.changeGoalStatus = async (req, res) => {
  try {
    const { goal_id, status } = req.body;


console.log(goal_id);
    // Validate input
    if (!goal_id || typeof status === "undefined") {
      return res.status(400).json({
        status: false,
        message: "goal_id and status are required.",
      });
    }

    // 🔐 Get logged-in user from token
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

    const loginUserId = decoded.id;

    // Find the logged-in user
    const loginUser = await User.findOne({
      where: { id: loginUserId },
      attributes: ["id", "full_name"],
    });

    // 1️⃣ Find goal
    const goal = await Goal.findOne({
      where: { id: goal_id },
      attributes: ["id", "name", "status", "treatment_id"],
    });

    if (!goal) {
      return res.status(404).json({
        status: false,
        message: "Goal not found.",
      });
    }

    // 2️⃣ Update goal status
    goal.status = 1;
    await goal.save();

    // 3️⃣ Find related Treatment
    const treatment = await Treatment.findOne({
      where: { id: goal.treatment_id },
      attributes: ["id", "created_by"],
    });

    if (!treatment) {
      return res.status(404).json({
        status: false,
        message: "Treatment not found for this goal.",
      });
    }


    // 4️⃣ Find the user who created the treatment
    const treatmentCreator = await User.findOne({
      where: { id: treatment.created_by },
      attributes: ["id", "full_name", "push_token"],
    });

    if (!treatmentCreator || !treatmentCreator.push_token || treatmentCreator.push_token.trim() === "") {
      console.log("⚠️ Treatment creator or valid push token not found, skipping notification");
      return res.status(200).json({
        status: true,
        message: "Goal status updated successfully, but no valid push token found.",
      });
    }

const message = {
  token: treatmentCreator.push_token,
  notification: {
    title: "Goal Completed 🎯",
    body: `${loginUser.full_name} has completed the ${goal.name}.`,
  },
  data: {
    type: "Goal Completed",
    id: goal.treatment_id.toString(),
    goal_id: goal.id.toString(),
  },
};
    // 6️⃣ Send Notification
    try {
      await admin.messaging().send(message);
      console.log("✅ Firebase notification sent successfully");
    } catch (fcmError) {
      console.error("❌ Firebase notification error:", fcmError);
    }

    // 7️⃣ Final Response
    return res.status(200).json({
      status: true,
      message: "Goal status updated successfully and notification sent.",
    });

  } catch (err) {
    console.error("Change Goal Status Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};

exports.changeTreatmentStatus = async (req, res) => {
  try {
    const { treatment_id, status } = req.body;


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
  const loginUserId = decoded.id;
  const loginUser = await User.findOne({
    where: { id: loginUserId },
    attributes: ["id", "full_name"],
  });



    // 🧾 Validation
    if (!treatment_id || typeof status === "undefined") {
      return res.status(400).json({
        status: false,
        message: "treatment_id and status are required.",
      });
    }

    // 📌 Find treatment by ID
    const treatment = await Treatment.findOne({ where: { id: treatment_id } });

    if (!treatment) {
      return res.status(404).json({
        status: false,
        message: "Treatment not found.",
      });
    }

    // ✅ Update treatment status
    treatment.status = status;
    await treatment.save();
    const treatmentCreator = await User.findOne({
    where: { id: treatment.created_by },
    attributes: ["id", "full_name", "push_token"],
    });

        const message = {
  token: treatmentCreator.push_token,
  notification: {
    title: "Treatment Close",
    body: `${loginUser.full_name} has completed the Treatment.`,
  },
  data: {
    type: "Treatment Close",
    id: treatment.id.toString(),
    goal_id: treatment.id.toString(),
  },
};
    // 6️⃣ Send Notification
    try {
      await admin.messaging().send(message);
      console.log("✅ Firebase notification sent successfully");
    } catch (fcmError) {
      console.error("❌ Firebase notification error:", fcmError);
    }



    return res.status(200).json({
      status: true,
      message: "Treatment status updated successfully.",
      data: {
        id: treatment.id,
        status: treatment.status,
      },
    });

  } catch (err) {
    console.error("❌ Change Treatment Status Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};



exports.markdonetreatment = async (req, res) => {
  try {
    const { treatment_id, status } = req.body;

    // 🧾 Validation
    if (!treatment_id || typeof status === "undefined") {
      return res.status(400).json({
        status: false,
        message: "treatment_id and status are required.",
      });
    }

    // ✅ 1. Find treatment plan
    const treatmentPlan = await TreatmentPlan.findOne({ where: { id: treatment_id } });
    if (!treatmentPlan) {
      return res.status(404).json({
        status: false,
        message: "Treatment not found.",
      });
    }

    // ✅ 2. Update treatment status
    treatmentPlan.status = 1;
    await treatmentPlan.save();

    // ✅ 3. Get treatment details (to find client and staff info)
    const treatment = await Treatment.findOne({
      where: { id: treatment_id },
      attributes: ["id", "client_id", "created_by"], // created_by is staff_id
    });

    if (!treatment) {
      return res.status(404).json({
        status: false,
        message: "Treatment record not found.",
      });
    }

    // ✅ 4. Get client details
    const clientDetails = await Client.findOne({
      where: { id: treatment.client_id },
      attributes: ["id", "user_id"],
    });

    // 🔒 Notification tabhi bhejna hai jab client details milti hain
    if (clientDetails) {
      // ✅ 5. Get client’s assigned user (treatment creator)
      const treatmentCreator = await User.findOne({
        where: { id: clientDetails.user_id },
        attributes: ["id", "full_name", "push_token"],
      });

      // ✅ 6. Get staff (created_by)
      const staffUser = await User.findOne({
        where: { id: treatment.created_by },
        attributes: ["id", "full_name"],
      });

      // ✅ 7. Prepare & send notification
      if (treatmentCreator && treatmentCreator.push_token) {
        const message = {
          token: treatmentCreator.push_token,
          notification: {
            title: "Treatment Complete",
            body: `${staffUser.full_name} has completed the Treatment.`,
          },
          data: {
            type: "Treatment Complete",
            id: treatment_id.toString(),
            goal_id: treatment_id.toString(),
          },
        };

        try {
          await admin.messaging().send(message);
          console.log("✅ Firebase notification sent successfully");
        } catch (fcmError) {
          console.error("❌ Firebase notification error:", fcmError);
        }
      }
    }

    // ✅ 8. Final Response
    return res.status(200).json({
      status: true,
      message: "Treatment status updated successfully.",
      data: {
        id: treatmentPlan.id,
        status: treatmentPlan.status,
      },
    });
  } catch (err) {
    console.error("❌ Change Treatment Status Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};



exports.markdoneproduct = async (req, res) => {
  try {
    const { treatment_id, product_id, date,dose_time } = req.body;

if (!treatment_id || treatment_id === "null" || treatment_id === "undefined") {
  return res.status(400).json({
    status: false,
    message: "treatment_id is required.",
  });
}

if (!product_id || product_id === "null" || product_id === "undefined") {
  return res.status(400).json({
    status: false,
    message: "Product is required.",
  });
}

if (!date || date === "null" || date === "undefined") {
  return res.status(400).json({
    status: false,
    message: "date is required.",
  });
}


    // 📅 Convert dd-mm-yyyy → yyyy-mm-dd safely
    const parts = date.split("-");
    if (parts.length !== 3) {
      return res.status(400).json({
        status: false,
        message: "Invalid date format. Expected dd-mm-yyyy.",
      });
    }

    const formattedDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const parsedDate = new Date(formattedDateStr);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        status: false,
        message: "Invalid date. Please send valid dd-mm-yyyy format.",
      });
    }

    // 🚫 Check for future date
    const today = new Date();
    // remove time for fair comparison
    today.setHours(0, 0, 0, 0);
    parsedDate.setHours(0, 0, 0, 0);

    if (parsedDate > today) {
      return res.status(400).json({
        status: false,
        message: "Cannot mark product as done for a future date.",
      });
    }

    // 📌 Check if treatment exists
    const treatment = await TreatmentPlan.findOne({ where: { id: treatment_id } });
    if (!treatment) {
      return res.status(404).json({
        status: false,
        message: "Treatment not found.",
      });
    }

    // 🧾 Insert history record (if not already exists)
    const existingHistory = await TreatmentProductsHistory.findOne({
      where: {
        product_id,
        treatment_id,
        date: formattedDateStr,
      },
    });

    if (existingHistory) {
      return res.status(400).json({
        status: false,
        message: "This product has already been marked done for this date.",
      });
    }

    await TreatmentProductsHistory.create({
      product_id,
      treatment_id,
      dose_time,
      date: parsedDate, // ✅ stored as yyyy-mm-dd
    });

    return res.status(200).json({
      status: true,
      message: "Product marked as done successfully.",
      treatment: {
        id: treatment.id,
        status: treatment.status,
      },
    });

  } catch (err) {
    console.error("❌ markdoneproduct Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};


exports.productrepurchase = async (req, res) => {

  console.log("hello");
  try {
    const { treatment_id, product_id,status } = req.body;

if (!treatment_id || treatment_id === "null" || treatment_id === "undefined") {
  return res.status(400).json({
    status: false,
    message: "treatment_id is required.",
  });
}

if (!product_id || product_id === "null" || product_id === "undefined") {
  return res.status(400).json({
    status: false,
    message: "Product is required.",
  });
}

    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const user_id = decoded.id;



    await TreatmentProductsRepurchase.create({
      product_id,
      treatment_id,
      status,
      user_id,
    });

    return res.status(200).json({
      status: true,
      message: "Product RePurchase successfully.",
    });

  } catch (err) {
    console.error("❌ markdoneproduct Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};




exports.newdashboard = async (req, res) => {
  try {
    const { name } = req.query || {};
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const user_id = decoded.id;
    const baseUrl = process.env.BASE_PATH?.endsWith("/")
      ? process.env.BASE_PATH
      : process.env.BASE_PATH + "/";

    // 1️⃣ Get client IDs
    const clients = await Client.findAll({
      where: { user_id },
      attributes: ["id"],
      raw: true,
    });
    const clientIds = clients.map(c => c.id);
    if (!clientIds.length) {
      //return res.status(404).json({ status: false, message: "Client not found" });
    }

const clinic_ids = await Treatment.findAll({
  where: { client_id: clientIds },   // multiple client_id filter
  attributes: ['id', 'clinic_id'],
  raw: true
});



const categories = await CategoryModel.findAll({
      order: [["createdAt", "DESC"]],
    });
        const updatedCategories = await Promise.all(
      categories.map(async category => {
        const imagePath = category.image?.startsWith("http")
          ? category.image
          : baseUrl + category.image;
        const totalClinic = await User.count({
          where: { user_role_id: 4 },
          include: [
            {
              model: ClinicServices,
              as: "clinic_services",
              required: true,
              where: { category_id: category.id },
              attributes: [],
            },
          ],
          distinct: true,
          col: "id",
        });
        return {
          ...category.toJSON(),
          image: imagePath,
          total_clinic: totalClinic,
        };
      })
    );
    const filteredCategories = name
      ? updatedCategories.filter(item =>
          item.title.toLowerCase().includes(name.toLowerCase())
        )
      : updatedCategories;
const allTreatments = await Treatment.findAll({
  where: { client_id: clientIds },   // multiple client_id filter
  attributes: ['id', 'clinic_id'],
  raw: true
});




    const followedClinicIds = clinic_ids.map(c => c.clinic_id);
    // 🔹 Clinic list with reviews
    const cliniclist = await User.findAll({
      where: { id: followedClinicIds, user_role_id: 4 },
      attributes: ["id", "clinic_name", "email", "mobile", "avatar", "status", "address"],
      include: [
        {
          model: ClinicReview,
          as: "reviews",
          required: false,
          attributes: ["rating"],
        },
      ],
    });
    const updatedClinicList = cliniclist.map(clinic => {
      const reviews = clinic.reviews || [];
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = reviews.length ? (totalRating / reviews.length).toFixed(1) : 0;
      return {
        id: clinic.id,
        name: clinic.clinic_name,
        email: clinic.email,
        mobile: clinic.mobile,
        avatar: clinic.avatar
          ? clinic.avatar.startsWith("http")
            ? clinic.avatar
            : baseUrl + clinic.avatar
          : null,
        status: clinic.status,
        address: clinic.address,
        rating: avgRating,
        distance: "2.5",
        totalReviews: reviews.length,
        favorite_status: followedClinicIds.includes(clinic.id),
      };
    });

    // 2️⃣ Get treatments
const treatments = await Treatment.findAll({
  where: {
    client_id: clientIds,
    status: 1, // ✅ only status 1
  },
  attributes: ["id", "clinic_id", "status", "front", "left", "right"],
  raw: true,
});

    const treatmentIds = treatments.map(t => t.id);

    if (!treatmentIds.length) {
      return res.status(200).json({
        status: true,
        message: "No treatments found.",
        data: { ongoing_treatments: [], next_treatment: [], treatment_list: [], productReminders: [], Goalsreminders: [],categories: filteredCategories, },
      });
    }

    // Map treatment_id => treatment
    const treatmentMap = {};
    treatments.forEach(t => treatmentMap[t.id] = t);

    // 3️⃣ Treatment plans
    const treatmentPlans = await TreatmentPlan.findAll({
      where: { treatment_id: { [Op.in]: treatmentIds } },
      raw: true,
    });

    // 4️⃣ Services map
    const catIds = [...new Set(treatmentPlans.map(tp => tp.cat_id))];
    const services = await Service.findAll({
      where: { id: { [Op.in]: catIds } },
      attributes: ["id", "name"],
      raw: true,
    });
    const serviceMap = {};
    services.forEach(s => serviceMap[s.id] = s.name);

    // 5️⃣ Clinics map
    const clinicIds = [...new Set(treatments.map(t => t.clinic_id))];
    const clinics = await User.findAll({
      where: { id: { [Op.in]: clinicIds } },
      attributes: ["id", "clinic_name", "address"],
      raw: true,
    });
    const clinicMap = {};
    clinics.forEach(c => clinicMap[c.id] = c);

    // 6️⃣ Format treatment plans with status
    const now = moment();
    const formattedPlans = treatmentPlans.map(tp => {
      const start = tp.start_date ? moment(tp.start_date) : null;
      const end = tp.end_date ? moment(tp.end_date) : null;
      const clinicId = treatmentMap[tp.treatment_id]?.clinic_id;
      const clinic = clinicMap[clinicId] || {};
      let status = "unknown";
      if (start && end) {
        if (now.isBetween(start, end, "day", "[]")) status = "active";
        else if (now.isBefore(start)) status = "upcoming";
        else if (now.isAfter(end)) status = "completed";
      }
      return {
        treatment_id: tp.treatment_id,
        name: serviceMap[tp.cat_id] || "Unknown Service",
        start_date: start ? formatDate(start) : null,
        end_date: end ? formatDate(end) : null,
        clinic_name: clinic.clinic_name || null,
        clinic_address: clinic.address || null,
        status,
      };
    });

    const ongoing_treatments = formattedPlans.filter(tp => tp.status === "active");
    const next_treatment = formattedPlans.filter(tp => tp.status === "upcoming");
    const treatment_list = formattedPlans;


    const totalTreatments = treatmentPlans.length;
    const completedTreatments = treatmentPlans.filter(t => t.status === 1).length;

    // 7️⃣ Product reminders
    const productPrescriptions = await ProductPrescriptions.findAll({
      where: { treatment_id: { [Op.in]: treatmentIds } },
      raw: true,
    });

    const totalSessions = calculateTotalSessions(productPrescriptions);
    const TotalTreatmentcount = await TreatmentProductsHistory.count({
  where: { treatment_id: { [Op.in]: treatmentIds } },
});
    const percentage = (TotalTreatmentcount / totalSessions) * 100;
const formattedPercentage = percentage.toFixed(2); // 2 decimal places



    const productIds = [...new Set(productPrescriptions.map(p => p.product_id))];
    const products = await Products.findAll({
      where: { id: { [Op.in]: productIds } },
      attributes: ["id", "title"],
      include: [{ model: ProductImages, as: "images", attributes: ["image_url"], limit: 1 }],
    });

    const productDataMap = {};
    products.forEach(p => {
      productDataMap[p.id] = {
        title: p.title,
        image: p.images && p.images.length
          ? baseUrl + p.images[0].image_url.replace(/^\/+/, "")
          : baseUrl + "uploads/products/no-image.jpg",
      };
    });

    // Get product history for completion calculation
    const productHistory = await TreatmentProductsHistory.findAll({
      where: { product_id: { [Op.in]: productIds } },
      raw: true,
    });
function formatLocalYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function histDateToYMD(hDate) {
  if (hDate === null || typeof hDate === "undefined") return null;

  // If it's already a Date instance
  if (hDate instanceof Date) {
    if (isNaN(hDate.getTime())) return null;
    return formatLocalYMD(hDate);
  }

  // If it's a number (timestamp)
  if (typeof hDate === "number") {
    const d = new Date(hDate);
    if (isNaN(d.getTime())) return null;
    return formatLocalYMD(d);
  }

  // If it's a string
  if (typeof hDate === "string") {
    // Try parseable ISO-like string first
    const parsed = new Date(hDate);
    if (!isNaN(parsed.getTime())) {
      return formatLocalYMD(parsed);
    }
    // fallback: if the string already looks like "YYYY-MM-DD"
    const maybeYMD = hDate.trim().split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(maybeYMD)) return maybeYMD;
    return null;
  }

  // otherwise unsupported type
  return null;
}

// --- Main mapping logic (uses helper above) ---
const productReminders = productPrescriptions.map(p => {
  const start = new Date(p.start_time);
  const end = new Date(p.end_time);
  const nowDate = new Date();

  if (nowDate < start || nowDate > end) return null;

  const productInfo = productDataMap[p.product_id] || {};
  const times = shouldShowReminder(p.frequency || "", start, nowDate);
  if (!times.length) return null;

  // Morning / Evening based on current hour
  const button_text = nowDate.getHours() < 12 ? "Morning" : "Evening";
  const button_time = nowDate.getHours() < 12 ? "Morning" : "Evening";

  // Today's local date
  const today = formatLocalYMD(nowDate);

  // Check if dose is already taken today
  const alreadyTaken = productHistory.some(h => {
    if (h.product_id !== p.product_id) return false;
    if (h.treatment_id !== p.treatment_id) return false;

    // status/taken normalization
    const statusTaken = (typeof h.status !== "undefined") ? (Number(h.status) === 1) : !!h.taken;
    if (!statusTaken) return false;

    // Try multiple possible date fields (date OR created_at)
    const histDateField = h.date ?? h.created_at ?? null;
    const histYMD = histDateToYMD(histDateField);
    if (!histYMD) return false;

    const histDose = (h.dose_time || "").toString().trim().toLowerCase();
    const targetDose = button_text.toLowerCase();

    return histYMD === today && histDose === targetDose;
  });

  if (alreadyTaken) return null;

  // Calculate completion %
  const totalScheduled = productHistory.filter(h => h.product_id === p.product_id).length;
  const totalTaken = productHistory.filter(h => h.product_id === p.product_id && (h.taken || Number(h.status) === 1)).length;
  const is_completed = totalScheduled ? totalTaken >= totalScheduled : false;

  return {
    id: p.product_id,
    product_title: productInfo.title || "Unknown Product",
    product_image: productInfo.image,
    dosage: p.dosage,
    frequency: p.frequency,
    treatment_id: p.treatment_id,
    tagline: "Great skin loves consistency! Time to apply your products.",
    is_completed,
    button_text,
    button_time,
  };
}).filter(Boolean);

    // ✅ Products stats
    const totalProducts = productReminders.length;
    const completedProducts = productReminders.filter(p => p.is_completed).length;

    // 8️⃣ Goals
    const allGoals = await Goal.findAll({
      where: { treatment_id: { [Op.in]: treatmentIds } },
      order: [["id", "ASC"]],
      raw: true,
    });

const DEFAULT_IMAGE = baseUrl + "uploads/treatments/no-image.jpg";

const Goalsreminders = allGoals
  .filter(g => g.status === 0) // only include incomplete goals
  .map(g => {
    const treatment = treatmentMap[g.treatment_id] || {};
    const treatmentImages = [
      { image_url: treatment.front ? baseUrl + treatment.front.replace(/^\/+/, "") : DEFAULT_IMAGE },
      { image_url: treatment.left ? baseUrl + treatment.left.replace(/^\/+/, "") : DEFAULT_IMAGE },
      { image_url: treatment.right ? baseUrl + treatment.right.replace(/^\/+/, "") : DEFAULT_IMAGE },
    ];

    return {
      id: g.id,
      treatment_id: g.treatment_id,
      status: g.status,
      name: g.name || "Unnamed Goal",
      tagline: "Keep going! Complete your treatment goals.",
      treatmentImages,
    };
  });

console.log({ Goalsreminders });

    // ✅ Goals stats
    const totalGoals = allGoals.length;
    const completedGoals = allGoals.filter(g => g.status === 1).length;
    // 9️⃣ Before images
    const treatmentImages = treatments.map(t => ({
      image_url: t.front ? baseUrl + t.front.replace(/^\/+/, "") : DEFAULT_IMAGE,
    }));


const goalsArray = allGoals.map(goal => {
  const treatment = allTreatments.find(t => t.id === goal.treatment_id);
  const clinicInfo = clinicMap[treatment?.clinic_id] || {};
  return {
    ...goal,
    status: goal.status === 1 || goal.status === "1" ? true : false, // ✅ convert 0/1 to true/false
    clinic_name: clinicInfo.clinic_name || null,
    clinic_address: clinicInfo.clinic_address || null,
  };
})


const treatmentProducts = await TreatmentProducts.findAll({
      where: { treatment_id: treatmentIds },
      attributes: ["treatment_id", "product_id"],
      raw: true,
    });

    const productClinicMap = treatmentProducts.map(p => {
      const treatment = allTreatments.find(t => t.id === p.treatment_id);
      return {
        product_id: p.product_id,
        clinic_name: clinicMap[treatment?.clinic_id]?.clinic_name || null,
        clinic_address: clinicMap[treatment?.clinic_id]?.clinic_address || null,
      };
    });

    let productsArray = [];
    let totalProductPercent = "0%";

    if (productIds.length) {
      const products = await Products.findAll({
        where: { id: productIds },
        attributes: ["id", "title", "dosage"],
        include: [
          {
            model: ProductImages,
            as: "images",
            attributes: ["image_url"],
            limit: 1,
          },
        ],
      });

      productsArray = products.map(p => {
        const clinicInfo = productClinicMap.find(x => x.product_id === p.id);
        return {
          id: p.id,
          title: p.title,
          dosage: p.dosage,
          image: p.images.length
            ? p.images[0].image_url
            : baseUrl + "uploads/products/no-image.jpg",
          clinic_name: clinicInfo?.clinic_name || null,
          clinic_address: clinicInfo?.clinic_address || null,
        };
      });

    }

const productPrescriptionsallproduct = await ProductPrescriptions.findAll({
  where: { treatment_id: { [Op.in]: treatmentIds } },
  raw: true,
});
// Step 2: Unique product_id list
const productIdss = [...new Set(productPrescriptionsallproduct.map(p => p.product_id))];

// Step 3: Product details fetch karo
const productss = await Products.findAll({
  where: { id: productIdss },
  attributes: ["id", "title", "dosage", "size","dose_value"],
  include: [
    {
      model: ProductImages,
      as: "images",
      attributes: ["image_url"],
      limit: 1,
    },
  ],
});

// Step 4: Build productRepurchase array with days calculation
const productRepurchase = productss
  .map(p => {
    const clinicInfo = productClinicMap.find(x => x.product_id === p.id);

    const prescription = productPrescriptionsallproduct.find(
      x => x.product_id === p.id
    );

    let daysLast = 0;
    let totalSessions = 0;
    let diffDays = 0;

    if (prescription?.start_time && prescription?.end_time) {
      const start = new Date();
      const end = new Date(prescription.end_time);

      diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      diffDays = Math.max(0, diffDays);

      const timesPerDay = getTimesPerDay(prescription.frequency);
      totalSessions = diffDays * timesPerDay;

      if (p.size && prescription.dose_value) {
        daysLast = p.size / (prescription.dose_value * timesPerDay);
      }
    }

    const showReminder = diffDays <= 3;

    return {
      id: p.id,
      treatment_id: p.id,
      title: p.title,
      dosage: prescription?.dosage || p.dosage,
      size: p.size,
      image: p.images.length
        ? p.images[0].image_url
        : baseUrl + "uploads/products/no-image.jpg",
      clinic_name: clinicInfo?.clinic_name || null,
      clinic_address: clinicInfo?.clinic_address || null,
      start_time: prescription?.start_time || null,
      end_time: prescription?.end_time || null,
      frequency: prescription?.frequency || null,
      dose_value: prescription?.dose_value || null,
      totalSessions,
      daysLast: Math.floor(daysLast),
      diffDays,
      showReminder,
    };
  })
  .filter(p => p.showReminder); // ✅ sirf showReminder true wale items rakhe





return res.status(200).json({
  status: true,
  message: "Dashboard data fetched successfully!",
  data: {
    treatment_stats: {
      totaltreatments: `${completedTreatments}/${totalTreatments}`,
      totalproduct: `${formattedPercentage}%`,
      totalgoals: `${completedGoals}/${totalGoals}`,
      goals: goalsArray,
      products: productsArray,
      before_images: treatmentImages,
      cliniclist: updatedClinicList,
    },
    categories: filteredCategories, // ✅ now guaranteed to exist
    ongoing_treatments,
    next_treatment,
    treatment_list,
    productReminders,
    productRepurchase,
    Goalsreminders,
  },
});

  } catch (error) {
    console.error("❌ Error fetching dashboard:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};




exports.TreatmentDetails = async (req, res) => {
  try {
    const { id: treatmentId } = req.params;
    const loginUserId = req.user.id;



    // 🔸 2. Fetch treatment plan to get cat_id & category_id
    const treatmentPlan = await TreatmentPlan.findOne({
      where: { id: treatmentId },
      attributes: ["treatment_id","cat_id", "service_categories","start_date","end_date"],
      raw: true,
    });




        // 🔸 1. Fetch treatment
    const treatment = await Treatment.findOne({
      where: { id: treatmentPlan.treatment_id },
      attributes: [
        "id",
        "client_id",
        "concerns",
        "front",
        "left",
        "right",
        "clinic_id",
        "created_by",
      ],
    });

    if (!treatment) {
      return res
        .status(404)
        .json({ status: false, message: "Treatment not found!" });
    }




    const catId = treatmentPlan?.cat_id || null;
    const categoryId = treatmentPlan?.category_id || null;

    // 🔸 3. Client info
    const client = await User.findOne({
      where: { id: treatment.clinic_id },
      attributes: [
        "id",
        "clinic_name",
        "email",
        "dob",
        "gender",
        "mobile",
        "avatar",
        "address",
        "city",
        "state",
        "website",
        "lat",
        "lon",
        "country",
      ],
    });

    // 🔸 4. Staff info
    const staff = await User.findOne({
      where: { id: treatment.created_by },
      attributes: [
        "id",
        "full_name",
        "email",
        "mobile",
        "avatar",
        "user_role_id",
      ],
    });

    // 🔸 5. Concerns
    const concernsList = treatment.concerns
      ? treatment.concerns.split(",")
      : [];

    // 🔸 6. Goals (convert 0/1 → false/true)
    const goalsRaw = await Goal.findAll({
      where: { treatment_id: treatment.id },
      attributes: ["id", "name", "status"],
      raw: true,
    });

    const goalsArray = goalsRaw.map((g) => ({
      ...g,
      status: g.status === 1 ? true : false,
    }));

    // 🔸 7. Fetch related Service from TreatmentPlan.cat_id
    let service = null;
    if (catId) {
      service = await Service.findOne({
        where: { id: catId },
        attributes: ["id","name", "precare", "postcare","category_id"],
      });
    }

    // 🔸 8. Fetch Category from TreatmentPlan.category_id
    let formattedCategories = [];
    if (service.category_id) {
      const categories = await CategoryModel.findAll({
        where: { id: service.category_id },
        attributes: ["title", "image"],
      });

      formattedCategories = categories.map((cat) => ({
        title: cat.title,
        image: cat.image
          ? `${process.env.BASE_PATH || "http://localhost:5000"}/api/${cat.image}`
          : null,
      }));
    }

    // 🔸 9. Date format helper
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    // 🔸 10. Final response
    const responseData = {
      client: client?.toJSON() || {},
      staff: staff ? staff.toJSON() : null,
      concerns: concernsList,
      goals: goalsArray,
      treatmentName: service?.name || "N/A",
      precare: service?.precare || "",
      postcare: service?.postcare || "",
      categories: formattedCategories,
      start_date: formatDate(treatmentPlan.start_date),
      end_date: formatDate(treatmentPlan.end_date),
      treatment_id: treatment.id,
      clinic_id: treatment.clinic_id,
    };

    return res.status(200).json({
      status: true,
      message: "Treatment details fetched successfully!",
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Error fetching treatment details:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};



exports.TreatmentProgressDetails = async (req, res) => {
  try {
    const { id: treatmentId } = req.params;
    const loginUserId = req.user.id;
        const treatment = await Treatment.findOne({
      where: { id: treatmentId },
      attributes: ["id", "client_id", "front", "left", "right", "concerns","created_at"],
      raw: true,
    });
    if (!treatment) {
      return res.status(404).json({
        status: false,
        message: "Treatment not found.",
      });
    }
    // ========================
    // 🧩 Helper Functions
    // ========================
    function formatDate(dateInput) {
      const date = new Date(dateInput);
      if (!dateInput || isNaN(date.getTime())) return "Invalid Date";
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    }

    function getWeekDifference(fromDate, toDate) {
      const diffMs = new Date(toDate) - new Date(fromDate);
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return Math.floor(diffDays / 7);
    }

    const treatmentImages = [
      { image_url: treatment.front || "http://localhost:5000/api/uploads/treatments/no-image.jpg" },
      { image_url: treatment.left || "http://localhost:5000/api/uploads/treatments/no-image.jpg" },
      { image_url: treatment.right || "http://localhost:5000/api/uploads/treatments/no-image.jpg" },
    ];

    // ========================
    // 📈 Progress History
    // ========================
    const progressEntries = await Progress.findAll({
      where: { treatment_id: treatment.id },
      order: [["created_at", "ASC"]],
      include: [
        {
          model: ProgressImage,
          as: "images",
          attributes: ["image"],
        },
        {
          model: ProgressComments,
          as: "comments",
          attributes: ["id", "comments", "user_id", "created_at"],
        },
        {
          model: User,
          as: "user",
          attributes: ["full_name", "avatar"],
        },
      ],
    });

const baseDate = progressEntries.length ? new Date(treatment.created_at) : null;
const progressHistory = progressEntries.map((entry, index) => {
  const entryDate = new Date(entry.createdAt);
  const weekDiff = baseDate ? getWeekDifference(baseDate, entryDate) : 0;

return {
  progress_id: entry.id,
  treatment_id: entry.treatment_id,
  user_name: entry.user?.full_name || "Unknown",
  avatar: entry.user?.avatar || null,
  treatment_date: formatDate(entry.createdAt),
  difference_from_first_entry: `Photos after ${weekDiff} week${weekDiff !== 1 ? "s" : ""}`,
  images: entry.images.map((img) => ({
    image_url: img.image,
  })),
};
});

    // ========================
    // 📊 Final Response
    // ========================
    const responseData = {
      treatment_id: treatment.id,
      client_id: treatment.client_id,
        before_images: treatmentImages,
      progress_history: progressHistory,
    };

    return res.status(200).json({
      status: true,
      message: "Treatment progress details fetched successfully!",
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Error fetching treatment progress details:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};

exports.removeTreatmentImage = async (req, res) => {
  try {
    const { treatment_id, key } = req.body;

    // 🧾 Validate required fields
    if (!treatment_id || !key) {
      return res.status(400).json({
        status: false,
        message: "treatment_id and key are required.",
      });
    }

    // 🧩 Allowed image keys
    const allowedKeys = ["front", "left", "right", "after_1", "after_2", "after_3", "after_4"];
    if (!allowedKeys.includes(key)) {
      return res.status(400).json({
        status: false,
        message: `Invalid key. Allowed keys are: ${allowedKeys.join(", ")}.`,
      });
    }

    // 🔍 Find treatment by ID
    const treatment = await Treatment.findOne({ where: { id: treatment_id } });

    if (!treatment) {
      return res.status(404).json({
        status: false,
        message: "Treatment not found.",
      });
    }

    // ✅ Set the specified image field to empty string
    treatment[key] = null;

    await treatment.save();

    return res.status(200).json({
      status: true,
      message: `${key} image removed successfully.`,
    });

  } catch (err) {
    console.error("❌ Remove Treatment Image Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};


exports.CompleteTreatmentPlan = async (req, res) => {
  try {
    

         const { client_id } = req.body;

    // ✅ Step 1: Get treatments for this client (including clinic_id)
    const treatments = await Treatment.findAll({
      where: { client_id: client_id },
      attributes: ["id", "clinic_id","concerns","price"],
      raw: true,
    });

    if (!treatments || treatments.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No treatments found for this client.",
        data: [],
      });
    }

    const treatmentIds = treatments.map((t) => t.id);
    const clinicIds = [...new Set(treatments.map((t) => t.clinic_id).filter(Boolean))];

    // ✅ Step 2: Fetch clinic data in bulk
    let clinics = [];
    if (clinicIds.length > 0) {
      clinics = await User.findAll({
        where: { id: clinicIds },
        attributes: ["id", "clinic_name", "email","address"],
        raw: true,
      });
    }

    // ✅ Step 3: Fetch treatment plans using treatment IDs
    const plans = await TreatmentPlan.findAll({
      where: { treatment_id: treatmentIds },
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

    // ✅ Step 4: Format plans with status, date, and clinic name
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

  // 👇 Find the clinic linked to this treatment
  const treatment = treatments.find((t) => t.id === plan.treatment_id); // ✅ this is correct

  const clinicData = clinics.find((c) => c.id === treatment?.clinic_id);

  return {
    id: plan.id,
    concerns: treatment?.concerns || [], // ✅ get from the single treatment
    price: treatment?.price || 0,        // ✅ get from the single treatment
    treatmentId: plan.treatment_id,
    treatment_status: plan.status,
    treatmentName: plan.category?.name || "N/A",
    image: "",
    status,
    treatmentDate: treatmentDate.format("DD-MM-YYYY"),
    clinic: clinicData
      ? {
          id: clinicData.id,
          name: clinicData.clinic_name,
          email: clinicData.email,
          address: clinicData.address,
        }
      : null,
  };
});

    return res.status(200).json({
      status: true,
      message: "Treatment plans fetched successfully!",
      data: formattedPlans,
    });
  } catch (error) {
    console.error("❌ TreatmentPlan Fetch Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};




