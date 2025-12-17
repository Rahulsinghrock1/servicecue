require("module-alias/register");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require("@config/config");
const { Sequelize } = require("sequelize");
const responseHelper = require("@helpers/ResponseHelper");
const { validationResult } = require("express-validator");
const { fileUploadOnServer } = require("@helpers/FileUploadHelper");
const { Op, literal } = require("sequelize");
const moment = require("moment");
const { Products, ProductImages,Category,Service,ProductPrescriptions,ProductCategory,ProductMeta,Productmetaoption,User,Client,TreatmentProductsHistory } = require("@models"); // Sequelize models import
const { uploadMediaFiles } = require("@helpers/multipleUpload"); // jo multer aapne banaya hai
const fs = require('fs');
const path = require('path');
const admin = require("@config/firebase");
const Treatment = require('@models/Treatment');

function getTimesPerDay(frequencyLabel) {
switch (frequencyLabel) {
  case "Morning Only (AM)":
  case "Evening Only (PM)":
    return 1;

  case "Morning & Evening (AM + PM)":
    return 2;

  case "Every 2nd Day":
    return 0.5; // every other day

  case "2 Times Weekly":
    return 2 / 7; // ≈ 0.285 per day

  case "3 Times Weekly":
    return 3 / 7; // ≈ 0.428 per day

  default:
    return 1;
}
}


exports.createOrUpdateProduct = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      uploadMediaFiles(req, res, (err) => (err ? reject(err) : resolve()));
    });

    let {
      edit_id,
      clinic_id,
      service_categories,
      treatments,
      title,
      weight,
      description,
      highlights,
      price,
      sale_price,
    } = req.body;

    if (!clinic_id || !title || !price) {
      return res.status(400).json({
        status: false,
        message: "clinic_id, title aur price required hai.",
      });
    }

    // ✅ Ensure arrays are stored correctly
    if (Array.isArray(service_categories)) {
      service_categories = service_categories.join(","); // "1,2,3"
    }
    if (Array.isArray(treatments)) {
      treatments = treatments.join(","); // "2,3"
    }

    let product;

    if (edit_id) {
      product = await Products.findByPk(edit_id);
      if (!product) {
        return res.status(404).json({ status: false, message: "Product not found" });
      }

      await product.update({
        clinic_id,
        service_categories,
        treatments,
        title,
        weight,
        description,
        highlights,
        price,
        sale_price,
      });
    } else {
      product = await Products.create({
        clinic_id,
        service_categories,
        treatments,
        title,
        weight,
        description,
        highlights,
        price,
        sale_price,
      });
    }

    // ✅ Save Images
    if (req.files && req.files.length > 0) {
      const imagesData = req.files.map((file) => ({
        product_id: product.id,
        image_url: `/uploads/products/${file.filename}`,
        alt_text: title,
        sort_order: 0,
      }));

      if (edit_id) {
        await ProductImages.destroy({ where: { product_id: product.id } });
      }

      await ProductImages.bulkCreate(imagesData);
    }

    return res.status(200).json({
      status: true,
      message: edit_id ? "Product updated successfully" : "Product created successfully",
      data: product,
    });
  } catch (err) {
    console.error("Product Create/Update Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};



exports.getProducts = async (req, res) => {
  try {
    const { client_id, clinic_id, title, category_id,type,limit  } = req.body;

    // 🔎 Base where condition
    const whereCondition = {};
    if (clinic_id) {
      whereCondition.clinic_id = clinic_id;
    }
    if (title) {
      whereCondition.title = { [Op.like]: `%${title}%` };
    }

    // ✅ category filter for MySQL/MariaDB JSON column
if (category_id) {
  // convert to number if possible
  const catIdNum = Number(category_id);
  // wrap in array for JSON_CONTAINS
  whereCondition[Op.and] = literal(
    `JSON_CONTAINS(service_categories, '${JSON.stringify([catIdNum])}')`
  );
}



const products = await Products.findAll({
  where: {
    ...whereCondition,
    ...(type !== 2 && { status: 1 })
  },
  include: [
    {
      model: ProductImages,
      as: "images",
      attributes: ["id", "image_url", "alt_text", "sort_order"]
    },
    {
      model: ProductPrescriptions,
      as: "prescription",
      attributes: [
        "dosage", "when_to_use", "when_to_start", "when_to_stop",
        "time_option", "start_time", "end_time", "duration",
        "frequency", "intake_mode", "special_instraction", "timings"
      ],
      where: client_id ? { client_id } : undefined,
      required: false
    }
  ],
  order: [["id", "DESC"]],
  ...(limit ? { limit: Number(limit) } : {})   // ⭐ limit apply only if exists
});

    const formatted = await Promise.all(
      products.map(async (p) => {
        const prod = p.toJSON();
        const categoryIds = Array.isArray(prod.service_categories)
          ? prod.service_categories
          : JSON.parse(prod.service_categories || "[]");
        const treatmentIds = Array.isArray(prod.treatments)
          ? prod.treatments
          : JSON.parse(prod.treatments || "[]");

        const categories = await ProductCategory.findAll({
          where: { id: categoryIds },
          attributes: ["id", "title", "image"]
        });
        const services = await Service.findAll({
          where: { id: treatmentIds },
          attributes: ["id", "name"]
        });

        const typeRecord = await ProductMeta.findOne({
          where: { title: prod.type },
          attributes: ['id'],
        });

        const metaOptions = await Productmetaoption.findAll({
          where: { meta_id: typeRecord?.id },
          attributes: ['id', 'title'],
        });

        prod.service_categories = categories;
        prod.treatments = services;
        prod.dosagelist = metaOptions;

        if (prod.prescription) {
          const pres = prod.prescription;
          prod.dosage = pres.dosage;
          prod.frequency = pres.frequency;
          prod.intake_mode = pres.intake_mode;
          prod.special_instraction = pres.special_instraction;
          prod.timings = pres.timings
            ? typeof pres.timings === "string"
              ? JSON.parse(pres.timings)
              : pres.timings
            : [];
          prod.when_to_use = pres.when_to_use;
          prod.when_to_start = pres.when_to_start;
          prod.when_to_stop = pres.when_to_stop;
          prod.duration = pres.duration;
          prod.start_time = pres.start_time;
          prod.end_time = pres.end_time;
        }

        delete prod.prescription;
        return prod;
      })
    );

    return res.status(200).json({
      status: true,
      message: "Product list fetched successfully",
      data: formatted
    });
  } catch (err) {
    console.error("Get Products Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined
    });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Product fetch with images
    const product = await Products.findByPk(id, {
      include: [{ model: ProductImages, as: "images" }],
    });

    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    // 2️⃣ Files ko folder se delete karo
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        // uploads/products folder ka absolute path banao
        const filePath = path.resolve(
          process.cwd(),
          "uploads",
          "products",
          path.basename(img.image_url)
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // file ko hard delete karna
          console.log(`✅ Deleted file: ${filePath}`);
        } else {
          console.log(`⚠️ File not found: ${filePath}`);
        }
      });

      // 3️⃣ Related images ko DB se hard delete karo
      await ProductImages.destroy({
        where: { product_id: product.id },
        force: true, // ✅ Hard delete
      });
    }

    // 4️⃣ Product ko DB se hard delete karo
    await product.destroy({ force: true });

    return res.json({ status: true, message: "Product and related images deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

exports.ProductsDetails = async (req, res) => {
  try {
    const { id } = req.body;

    const product = await Products.findOne({
      where: { id },
      include: [
        {
          model: ProductImages,
          as: "images",
          attributes: ["id", "image_url", "alt_text", "sort_order"]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found"
      });
    }

    const prod = product.toJSON();

    // Parse category IDs
    const categoryIds = Array.isArray(prod.service_categories)
      ? prod.service_categories
      : JSON.parse(prod.service_categories || '[]');

    // Parse treatment IDs
    const treatmentIds = Array.isArray(prod.treatments)
      ? prod.treatments
      : JSON.parse(prod.treatments || '[]');

    // Fetch Category details
    const categories = await ProductCategory.findAll({
      where: { id: categoryIds },
      attributes: ['id', 'title', 'image']
    });

    // Fetch Service (Treatment) details
    const services = await Service.findAll({
      where: { id: treatmentIds },
      attributes: ['id', 'name']
    });

    // Attach to product
    prod.service_categories = categories;
    prod.treatments = services;

    // Attach first image for preview
    prod.main_image = prod.images?.length > 0 ? prod.images[0].image_url : null;

    return res.status(200).json({
      status: true,
      message: "Product details fetched successfully",
      data: prod
    });

  } catch (err) {
    console.error("Get Product Detail Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined
    });
  }
};


exports.deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params; // 🧠 This is the image ID (from ProductImages table)

    // 1️⃣ Find the image record
    const imageRecord = await ProductImages.findByPk(id);

    if (!imageRecord) {
      return res.status(404).json({ status: false, message: "Image not found" });
    }

    // 2️⃣ Delete image file from uploads/products/
    const filePath = path.resolve(
      process.cwd(),
      "uploads",
      "products",
      path.basename(imageRecord.image_url)
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted image file: ${filePath}`);
    } else {
      console.log(`⚠️ Image file not found: ${filePath}`);
    }

    // 3️⃣ Delete image record from DB
    await imageRecord.destroy({ force: true }); // Hard delete

    return res.json({ status: true, message: "Product image deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product image:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};




// -----------------------------
// 🔔 Helper function: Notification
// -----------------------------
async function sendPrescriptionEditNotification(edit_id, staff_id) {
  try {
    const treatment = await Treatment.findOne({
      where: { id: edit_id },
      attributes: ["id", "client_id", "created_by"],
    });

    if (!treatment) return;

    const clientDetails = await Client.findOne({
      where: { id: treatment.client_id },
      attributes: ["id", "user_id"],
    });

    if (!clientDetails) return;

    const treatmentCreator = await User.findOne({
      where: { id: clientDetails.user_id },
      attributes: ["id", "full_name", "push_token"],
    });

    const staffUser = await User.findOne({
      where: { id: treatment.created_by },
      attributes: ["id", "full_name"],
    });

    if (treatmentCreator && treatmentCreator.push_token) {
      const message = {
        token: treatmentCreator.push_token,
        notification: {
          title: "Edit Product Prescriptions",
          body: `your product prescription has been updated. Kindly review the details.`,
        },
        data: {
          type: "Edit Product Prescriptions",
          id: edit_id.toString(),
          goal_id: edit_id.toString(),
        },
      };

      await admin.messaging().send(message);
      console.log("✅ Firebase notification sent successfully");
    }
  } catch (error) {
    console.error("❌ Notification Error:", error);
  }
}




exports.treatmentProducts = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Authentication token is required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const user_id = decoded.id;

    let { date, treatment_id } = req.body;

    let formattedDate = null;
    if (date) {
      const parsed = moment(date, "DD-MM-YYYY", true);
      if (!parsed.isValid()) {
        return res.status(400).json({
          status: false,
          message: "Invalid date format. Expected DD-MM-YYYY.",
        });
      }
      formattedDate = parsed.format("YYYY-MM-DD");
    }

    const client = await Client.findOne({
      where: { user_id },
      attributes: ["id"],
    });

    if (!client) {
      return res.status(404).json({
        status: false,
        message: "Client not found.",
      });
    }

    const client_id = client.id;

    const activeTreatments = await Treatment.findAll({
      where: { client_id, status: 1 },
      attributes: ["id"],
      raw: true,
    });

    const activeTreatmentIds = activeTreatments.map((t) => t.id);

    if (!activeTreatmentIds.length) {
      return res.status(200).json({
        status: true,
        message: "No active treatments found.",
        data: [],
      });
    }

    const presWhere = {
      client_id,
      treatment_id: { [Op.in]: activeTreatmentIds },
    };

    if (formattedDate) {
      presWhere.start_time = { [Op.lte]: formattedDate };
      presWhere.end_time = { [Op.gte]: formattedDate };
    }

    if (treatment_id) {
      presWhere.treatment_id = Array.isArray(treatment_id)
        ? { [Op.in]: treatment_id }
        : treatment_id;
    }

    const prescriptions = await ProductPrescriptions.findAll({
      where: presWhere,
      attributes: [
        "product_id",
        "treatment_id",
        "dosage",
        "frequency",
        "intake_mode",
        "special_instraction",
        "when_to_use",
        "when_to_start",
        "when_to_stop",
        "duration",
        "start_time",
        "end_time",
      ],
      raw: true,
    });

    const clientProductIds = prescriptions.map((p) => p.product_id);

    if (!clientProductIds.length) {
      return res.status(200).json({
        status: true,
        message: "No products found.",
        data: [],
      });
    }

    const products = await Products.findAll({
      where: { id: { [Op.in]: clientProductIds } },
      include: [
        {
          model: ProductImages,
          as: "images",
          attributes: ["id", "image_url", "alt_text", "sort_order"],
        },
      ],
      order: [["id", "DESC"]],
    });

    const formatted = await Promise.all(
      products.map(async (product) => {
        const prod = product.toJSON();

        // merge prescription data
        const prescriptionData = prescriptions.find((p) => p.product_id === prod.id);
        if (prescriptionData) {
          Object.assign(prod, prescriptionData);
        }

        // Parse categories
        const categoryIds = Array.isArray(prod.service_categories)
          ? prod.service_categories
          : JSON.parse(prod.service_categories || "[]");

        const treatmentIds = Array.isArray(prod.treatments)
          ? prod.treatments
          : JSON.parse(prod.treatments || "[]");

        const [categories, services] = await Promise.all([
          Category.findAll({ where: { id: categoryIds }, attributes: ["id", "title", "image"] }),
          Service.findAll({ where: { id: treatmentIds }, attributes: ["id", "name"] }),
        ]);

        prod.service_categories = categories;
        prod.treatments = services;

        // ------------------------------
        // 🗓️ DATE RANGE VALIDATION
        // ------------------------------
        if (formattedDate && prod.start_time && prod.end_time) {
          const today = moment(formattedDate, "YYYY-MM-DD");
          const start = moment(prod.start_time, "YYYY-MM-DD");
          const end = moment(prod.end_time, "YYYY-MM-DD");

          if (!today.isBetween(start, end, "day", "[]")) {
            return null;
          }
        }

        // ------------------------------
        // ⭐ FREQUENCY LOGIC
        // ------------------------------
        const freq = (prod.frequency || "").toLowerCase().trim();
        const start = moment(prod.start_time, "YYYY-MM-DD");
        const end = moment(prod.end_time, "YYYY-MM-DD");
        let validDates = [];

        // helper to generate alternate dates
        const getAlternateDates = (start, end, stepDays) => {
          const dates = [];
          let current = moment(start);
          while (current.isSameOrBefore(end)) {
            dates.push(current.format("YYYY-MM-DD"));
            current.add(stepDays, "days");
          }
          return dates;
        };

        // 1️⃣ Every 2nd Day
        if (freq === "every 2nd day") {
          validDates = getAlternateDates(start, end, 2);
          prod.showAlternative = true;
        }

        // 2️⃣ 2–3 Times Weekly (Mon, Wed, Fri, Sat, Sun)
        else if (freq === "2–3 times weekly") {
          const allowedDays = [1, 3, 5, 6, 0]; // Mon, Wed, Fri, Sat, Sun
          let current = moment(start);
          while (current.isSameOrBefore(end)) {
            if (allowedDays.includes(current.day())) {
              validDates.push(current.format("YYYY-MM-DD"));
            }
            current.add(1, "day");
          }
          prod.showAlternative = true;
        }

        // 3️⃣ Daily (default)
        else {
          let current = moment(start);
          while (current.isSameOrBefore(end)) {
            validDates.push(current.format("YYYY-MM-DD"));
            current.add(1, "day");
          }
          prod.showAlternative = false;
        }

        // ❌ If today's date NOT in valid schedule → hide
        if (!validDates.includes(moment(formattedDate).format("YYYY-MM-DD"))) {
          return null;
        }

        // history usage
        if (formattedDate && prod.id && prod.treatment_id) {
          const existingHistory = await TreatmentProductsHistory.findOne({
            where: {
              product_id: prod.id,
              treatment_id: prod.treatment_id,
              date: formattedDate,
            },
            raw: true,
          });

          prod.status = existingHistory ? 1 : 0;
        }

        return prod;
      })
    );

    return res.status(200).json({
      status: true,
      message: "Product list fetched successfully.",
      data: formatted.filter(Boolean),
    });
  } catch (err) {
    console.error("❌ Get Products Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};



// exports.ProductPrescriptions = async (req, res) => {
//   try {
//     // ✅ Verify token
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return res.status(401).json({ message: "Authentication token is required." });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
//     const staff_id = decoded.id;
//     if (!staff_id) {
//       return res.status(401).json({ message: "Invalid token payload." });
//     }
//     // ✅ Extract data from request
//     let {
//       product_id,
//       client_id,
//       dosage,
//       whenToUse,
//       whenToStart,
//       whenToStop,
//       duration,
//       frequency,
//       intakeMode,
//       timings,
//       time_option,
//       start_time,
//       edit_id,
//       treatmentId, // ✅ optional (frontend may still send this)
//       special_instraction,
//     } = req.body;
//     let doseValueToSave = null;
//     edit_id = edit_id || treatmentId;
//     if (!product_id || !client_id) {
//       return res.status(400).json({
//         status: false,
//         message: "product_id and client_id are required.",
//       });
//     }
//     timings = typeof timings === "string" ? JSON.parse(timings) : timings;
//     let dbStartTime = null;
//     let dbEndTime = null;
//     if (start_time) {
//       const parsedStart = moment(start_time, "DD-MM-YYYY", true);
//       if (!parsedStart.isValid()) {
//         console.log("❌ Invalid start_time format:", start_time);
//         return res.status(400).json({
//           status: false,
//           message: "Invalid start_time format. Expected DD-MM-YYYY.",
//         });
//       }
//       dbStartTime = parsedStart.format("YYYY-MM-DD");
//       if (duration && duration.includes("Week")) {
//         const weeks = parseInt(duration);
//         dbEndTime = parsedStart.clone().add(weeks, "weeks").format("YYYY-MM-DD");
//       } else if (duration === "Ongoing Until Review") {
//         dbEndTime = parsedStart.clone().add(10, "years").format("YYYY-MM-DD");
//       }
//     }
//     // ✅ Calculate expected_end_time & expected_days
//     let expectedEndTime = null;
//     let expectedDays = null;
//     if (dbStartTime && product_id && dosage && frequency) {
//       const product = await Products.findOne({
//         where: { id: product_id },
//         attributes: ["size"],
//       });
//       const dosageMetaRaw = await Productmetaoption.findOne({
//         where: { title: dosage },
//         attributes: ["value", "title"],
//       });
//       const dosageMeta = dosageMetaRaw ? dosageMetaRaw.get({ plain: true }) : null;
//       if (product && product.size && dosageMeta && dosageMeta.value > 0) {
//         const dosageValue = parseFloat(dosageMeta.value);
//         doseValueToSave = dosageValue;
//         const timesPerDay = getTimesPerDay(frequency);
//         if (timesPerDay > 0) {
//           expectedDays = product.size / (dosageValue * timesPerDay);
//           const parsedStart = moment(dbStartTime, "YYYY-MM-DD");
//           expectedEndTime = parsedStart.clone().add(expectedDays, "days").format("YYYY-MM-DD");
//         }
//       }
//     }
//     const formatDateOnly = (date) => (date ? moment(date).format("YYYY-MM-DD") : null);
//     const prescriptionData = {
//       staff_id,
//       product_id,
//       client_id,
//       dosage,
//       dose_value: doseValueToSave,
//       when_to_use: whenToUse,
//       when_to_start: whenToStart,
//       when_to_stop: whenToStop,
//       duration,
//       frequency,
//       intake_mode: intakeMode,
//       timings,
//       time_option,
//       start_time: formatDateOnly(dbStartTime),
//       end_time: formatDateOnly(dbEndTime),
//       expected_end_time: formatDateOnly(expectedEndTime),
//       expected_days: expectedDays ? parseFloat(expectedDays.toFixed(2)) : null, // ✅ store total days
//       special_instraction,
//     };

//     // ✅ Check if existing record exists
//     let existingPrescription = await ProductPrescriptions.findOne({
//       where: { product_id, client_id },
//     });

//     let prescription;

//     if (existingPrescription) {
//       await existingPrescription.update(prescriptionData);
//       prescription = existingPrescription;

//       // ✅ Send notification only if edit_id provided
//       if (edit_id) {
//         const treatment = await Treatment.findOne({
//           where: { id: edit_id },
//           attributes: ["id", "client_id", "created_by"],
//         });

//         if (!treatment) {
//           return res.status(404).json({
//             status: false,
//             message: "Treatment record not found.",
//           });
//         } else {
//           const clientDetails = await Client.findOne({
//             where: { id: treatment.client_id },
//             attributes: ["id", "user_id"],
//           });

//           if (clientDetails) {
//             const treatmentCreator = await User.findOne({
//               where: { id: clientDetails.user_id },
//               attributes: ["id", "full_name", "push_token"],
//             });

//             const staffUser = await User.findOne({
//               where: { id: treatment.created_by },
//               attributes: ["id", "full_name"],
//             });

//             if (treatmentCreator && treatmentCreator.push_token) {
//               const message = {
//                 token: treatmentCreator.push_token,
//                 notification: {
//                   title: "Edit Product Prescriptions",
//                   body: `${staffUser.full_name} has updated the Product Prescriptions.`,
//                 },
//                 data: {
//                   type: "Edit Product Prescriptions",
//                   id: edit_id.toString(),
//                   goal_id: edit_id.toString(),
//                 },
//               };

//               try {
//                 await admin.messaging().send(message);
//                 console.log("✅ Firebase notification sent successfully");
//               } catch (fcmError) {
//                 console.error("❌ Firebase notification error:", fcmError);
//               }
//             }
//           }
//         }
//       }

//       return res.status(200).json({
//         status: true,
//         message: "Prescription updated successfully.",
//         prescription,
//       });
//     } else {
//       prescription = await ProductPrescriptions.create(prescriptionData);
//       return res.status(201).json({
//         status: true,
//         message: "Prescription created successfully.",
//         prescription,
//       });
//     }
//   } catch (err) {
//     console.error("❌ ProductPrescriptions Error:", err);
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error.",
//       error: err.message,
//     });
//   }
// };


exports.ProductPrescriptions = async (req, res) => {
  try {
    // 🔐 AUTH
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const staff_id = decoded.id;
    if (!staff_id) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    // 📥 REQUEST DATA
    let {
      product_id,
      client_id,
      dosage,
      frequency,
      intakeMode,
      timings,
      time_option,
      start_time,
      edit_id,
      treatmentId,
      special_instraction,
    } = req.body;

    const treatment_id = edit_id || treatmentId;

    if (!product_id || !client_id || !dosage || !frequency || !treatment_id) {
      return res.status(400).json({
        status: false,
        message:
          "product_id, client_id, dosage, frequency and treatment_id are required.",
      });
    }

    timings = typeof timings === "string" ? JSON.parse(timings) : timings;

    // 📦 PRODUCT SIZE
    const product = await Products.findOne({
      where: { id: product_id },
      attributes: ["size"],
      raw: true,
    });

    if (!product || !product.size) {
      return res.status(400).json({
        status: false,
        message: "Product size not found.",
      });
    }

    const totalSize = parseFloat(product.size);

    // 💊 NEW DOSE VALUE (ALWAYS FROM META)
    const dosageMeta = await Productmetaoption.findOne({
      where: { title: dosage },
      attributes: ["value"],
      raw: true,
    });

    if (!dosageMeta || dosageMeta.value == null) {
      return res.status(400).json({
        status: false,
        message: "Invalid dosage selected. Dose value not found.",
      });
    }

    const newDoseValue = parseFloat(dosageMeta.value);
    if (newDoseValue <= 0) {
      return res.status(400).json({
        status: false,
        message: "Dose value must be greater than zero.",
      });
    }

    // ⏰ TIMES PER DAY
    const timesPerDay = getTimesPerDay(frequency);
    if (!timesPerDay || timesPerDay <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid frequency.",
      });
    }

    // 📜 EXISTING PRESCRIPTION (OLD DOSE)
    const existingPrescription = await ProductPrescriptions.findOne({
      where: { product_id, client_id },
      attributes: ["dose_value", "start_time"],
      raw: true,
    });

    const oldDoseValue = existingPrescription?.dose_value
      ? parseFloat(existingPrescription.dose_value)
      : newDoseValue;

    // 📊 TOTAL DOSES TAKEN (TREATMENT_ID BASED)
    const totalDoseCount = await TreatmentProductsHistory.count({
      where: {
        product_id,
        treatment_id, // ✅ FIXED
      },
    });

    // 🧮 CONSUMED QUANTITY (OLD DOSE)
    const consumedQuantity = totalDoseCount * oldDoseValue;

    // 🧮 REMAINING QUANTITY
    let remainingQuantity = totalSize - consumedQuantity;
    if (remainingQuantity < 0) remainingQuantity = 0;

    // 🧮 EXPECTED DAYS (NEW DOSE)
    let expectedDays = null;
    let expectedEndTime = null;

    if (remainingQuantity > 0) {
      expectedDays = remainingQuantity / (newDoseValue * timesPerDay);
      expectedEndTime = moment()
        .add(Math.ceil(expectedDays), "days")
        .format("YYYY-MM-DD");
    }

    // 📅 START DATE
    let dbStartTime = existingPrescription?.start_time || null;
    if (start_time) {
      const parsed = moment(start_time, "DD-MM-YYYY", true);
      if (!parsed.isValid()) {
        return res.status(400).json({
          status: false,
          message: "Invalid start_time format. Use DD-MM-YYYY",
        });
      }
      dbStartTime = parsed.format("YYYY-MM-DD");
    }

    // 💾 SAVE DATA
    const prescriptionData = {
      staff_id,
      product_id,
      client_id,
      dosage,
      dose_value: newDoseValue, // ✅ ALWAYS UPDATE
      frequency,
      intake_mode: intakeMode,
      timings,
      time_option,
      start_time: dbStartTime,
      expected_days: expectedDays ? parseFloat(expectedDays.toFixed(2)) : null,
      expected_end_time: expectedEndTime,
      special_instraction,
    };

    let prescription;

    if (existingPrescription) {
      await ProductPrescriptions.update(prescriptionData, {
        where: { product_id, client_id },
      });

      prescription = await ProductPrescriptions.findOne({
        where: { product_id, client_id },
      });
    } else {
      prescription = await ProductPrescriptions.create(prescriptionData);
    }

    return res.status(200).json({
      status: true,
      message: "Prescription updated successfully.",
      calculation: {
        treatment_id,
        totalSize,
        oldDoseValue,
        newDoseValue,
        totalDoseCount,
        consumedQuantity,
        remainingQuantity,
        expected_days: expectedDays,
        expected_end_time: expectedEndTime,
      },
      prescription,
    });
  } catch (err) {
    console.error("❌ ProductPrescriptions Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};




exports.allProducts = async (req, res) => {
  try {
    const {
      client_id,
      clinic_id,
      name,       // product title filter
      brand,      // brand filter
      category,   // array of category IDs
      type,
      page = 1,   // pagination: current page
      limit = 100  // pagination: items per page
    } = req.body;

    const offset = (page - 1) * limit;

    const whereCondition = {};

    // 📌 Exclude products of the sending clinic
if (clinic_id && Array.isArray(clinic_id) && clinic_id.length > 0) {
  whereCondition.clinic_id = { [Op.in]: clinic_id };
}

    // 📌 Filter: product title
    if (name) {
      whereCondition.title = { [Op.like]: `%${name}%` };
    }

    // 📌 Filter: brand
    if (brand) {
      whereCondition.brand = { [Op.like]: `%${brand}%` };
    }

    // 📌 Filter: category array inside JSON column service_categories
    if (Array.isArray(category) && category.length > 0) {
      const categoryJson = JSON.stringify(category.map(Number));
      whereCondition[Op.and] = literal(
        `JSON_OVERLAPS(service_categories, '${categoryJson}')`
      );
    }

    // 🔹 Count total products (for pagination)
    const totalProducts = await Products.count({
      where: {
        ...whereCondition,
        ...(type !== 2 && { status: 1 })
      }
    });

    // 🔹 Fetch products with limit & offset
    const products = await Products.findAll({
      where: {
        ...whereCondition,
        ...(type !== 2 && { status: 1 })
      },
      include: [
        {
          model: ProductImages,
          as: "images",
          attributes: ["id", "image_url", "alt_text", "sort_order"]
        },
        {
          model: ProductPrescriptions,
          as: "prescription",
          attributes: [
            "dosage",
            "when_to_use",
            "when_to_start",
            "when_to_stop",
            "time_option",
            "start_time",
            "end_time",
            "duration",
            "frequency",
            "intake_mode",
            "special_instraction",
            "timings"
          ],
          where: client_id ? { client_id } : undefined,
          required: false
        }
      ],
      order: [["id", "DESC"]],
      limit,
      offset
    });

    // 🧩 Format output categories + services
    const formatted = await Promise.all(
      products.map(async (p) => {
        const prod = p.toJSON();

        // ---- Safe clinic fetch ----
        const user = await User.findOne({
          where: { id: prod.clinic_id },
          attributes: ["id", "clinic_name"]
        });
        prod.clinic = user ? user.clinic_name : null;

        // Parse JSON fields
        const categoryIds = Array.isArray(prod.service_categories)
          ? prod.service_categories
          : JSON.parse(prod.service_categories || "[]");

        const treatmentIds = Array.isArray(prod.treatments)
          ? prod.treatments
          : JSON.parse(prod.treatments || "[]");

        // Fetch mapped categories
        const categories = await ProductCategory.findAll({
          where: { id: categoryIds },
          attributes: ["id", "title", "image"]
        });

        // Fetch services
        const services = await Service.findAll({
          where: { id: treatmentIds },
          attributes: ["id", "name"]
        });

        prod.service_categories = categories;
        prod.treatments = services;

        return prod;
      })
    );

    return res.status(200).json({
      status: true,
      message: "Product list fetched successfully",
      data: formatted,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit)
      }
    });

  } catch (err) {
    console.error("Get Products Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined
    });
  }
};
exports.addSelectedProducts = async (req, res) => {
  try {
    const { product_ids,clinic_id } = req.body;

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return res.status(400).json({
        status: false,
        message: "product_ids array is required.",
      });
    }

    // Fetch master products with all relational data
    const products = await Products.findAll({
      where: { id: product_ids },
      include: [
        {
          model: ProductImages,
          as: "images",
          attributes: ["image_url", "alt_text", "sort_order"],
        },
      ],
    });
    if (!products.length) {
      return res.status(400).json({
        status: false,
        message: "No products found with given IDs.",
      });
    }
    let newProductIds = [];
    for (const p of products) {
      const newProduct = await Products.create({
        clinic_id: clinic_id,
        client_id: p.client_id || null,
        service_categories: p.service_categories,
        treatments: p.treatments,
        title: p.title,
        brand: p.brand,
        type: p.type,
        size: p.size,
        size_unit: p.size_unit,
        weight: p.weight,
        description: p.description,
        highlights: p.highlights,
        usage: p.usage,
        ingredients: p.ingredients,
        dosage: p.dosage,
        dose_value: p.dose_value,
        when_to_use: p.when_to_use,
        when_to_start: p.when_to_start,
        when_to_stop: p.when_to_stop,
        duration: p.duration,
        frequency: p.frequency,
        intake_mode: p.intake_mode,
        special_instraction: p.special_instraction,
        timings: p.timings,
        price: p.price,
        sale_price: p.sale_price,
        status: 1,
      });

      newProductIds.push(newProduct.id);
      if (p.images && p.images.length > 0) {
        const imgData = p.images.map((img) => ({
          product_id: newProduct.id,
          image_url: img.image_url.replace(/^https?:\/\/[^/]+\/api/, ""),
          alt_text: img.alt_text,
          sort_order: img.sort_order,
        }));
        await ProductImages.bulkCreate(imgData);
      }
    }
    return res.status(200).json({
      status: true,
      message: "Products cloned successfully.",
      new_product_ids: newProductIds,
    });
  } catch (err) {
    console.error("addSelectedProducts Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};