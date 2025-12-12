require("module-alias/register");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require("@config/config");
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
    const { client_id, clinic_id, title, category_id } = req.body;

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
      where: whereCondition,
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
      order: [["id", "DESC"]]
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



// exports.ProductPrescriptions = async (req, res) => {
//   try {
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return res.status(401).json({ message: "Authentication token is required." });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
//     const staff_id = decoded.id;
//     if (!staff_id) {
//       return res.status(401).json({ message: "Invalid token payload." });
//     }

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
//       special_instraction
//     } = req.body;

//     if (!product_id || !client_id) {
//       return res.status(400).json({
//         status: false,
//         message: "product_id and client_id are required.",
//       });
//     }

//     // ✅ Parse timings if it's a string
//     timings = typeof timings === "string" ? JSON.parse(timings) : timings;

//     // ✅ Parse start_time
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
//       dbStartTime = parsedStart.format("YYYY-MM-DD"); // ✅ format for DB

//       if (duration && duration.includes("Week")) {
//         const weeks = parseInt(duration); // "2 Weeks" => 2
//         dbEndTime = parsedStart.clone().add(weeks, "weeks").format("YYYY-MM-DD"); // DB format
//       } else if (duration === "Ongoing Until Review") {
//         dbEndTime = null;
//       }
//     }


//     const prescriptionData = {
//       staff_id,
//       product_id,
//       client_id,
//       dosage,
//       when_to_use: whenToUse,
//       when_to_start: whenToStart,
//       when_to_stop: whenToStop,
//       duration,
//       frequency,
//       intake_mode: intakeMode,
//       timings,
//       time_option,
//       start_time: dbStartTime,
//       end_time: dbEndTime,
//       special_instraction
//     };

//     let existingPrescription = await ProductPrescriptions.findOne({
//       where: { product_id, client_id },
//     });

//     let prescription;

//     if (existingPrescription) {
//       await existingPrescription.update(prescriptionData);
//       prescription = existingPrescription;

//        const treatment = await Treatment.findOne({
//       where: { id: edit_id },
//       attributes: ["id", "client_id", "created_by"], // created_by is staff_id
//     });

//     if (!treatment) {
//       return res.status(404).json({
//         status: false,
//         message: "Treatment record not found.",
//       });
//     }

//     // ✅ 4. Get client details
//     const clientDetails = await Client.findOne({
//       where: { id: treatment.client_id },
//       attributes: ["id", "user_id"],
//     });

//     // 🔒 Notification tabhi bhejna hai jab client details milti hain
//     if (clientDetails) {
//       // ✅ 5. Get client’s assigned user (treatment creator)
//       const treatmentCreator = await User.findOne({
//         where: { id: clientDetails.user_id },
//         attributes: ["id", "full_name", "push_token"],
//       });

//       // ✅ 6. Get staff (created_by)
//       const staffUser = await User.findOne({
//         where: { id: treatment.created_by },
//         attributes: ["id", "full_name"],
//       });

//       // ✅ 7. Prepare & send notification
//       if (treatmentCreator && treatmentCreator.push_token) {
//         const message = {
//           token: treatmentCreator.push_token,
//           notification: {
//             title: "Edit Product Prescriptions",
//             body: `${staffUser.full_name} has update the Product Prescriptions.`,
//           },
//           data: {
//             type: "Edit Product Prescriptions",
//             id: edit_id.toString(),
//             goal_id: edit_id.toString(),
//           },
//         };

//         try {
//           await admin.messaging().send(message);
//           console.log("✅ Firebase notification sent successfully");
//         } catch (fcmError) {
//           console.error("❌ Firebase notification error:", fcmError);
//         }
//       }
//     }

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
    // -----------------------------
    // 🔹 Verify JWT
    // -----------------------------
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res
        .status(401)
        .json({ message: "Authentication token is required." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const staff_id = decoded.id;
    if (!staff_id)
      return res.status(401).json({ message: "Invalid token payload." });

    // -----------------------------
    // 🔹 Extract body fields
    // -----------------------------
    let {
      product_id,
      client_id,
      dosage,
      whenToUse,
      whenToStart,
      whenToStop,
      duration,
      frequency,
      intakeMode,
      timings,
      time_option,
      start_time,
      edit_id,
      special_instraction,
    } = req.body;

    if (!product_id || !client_id) {
      return res.status(400).json({
        status: false,
        message: "product_id and client_id are required.",
      });
    }

    console.log(client_id);

    // -----------------------------
    // 🔹 Parse timings safely
    // -----------------------------
    if (typeof timings === "string") {
      try {
        timings = JSON.parse(timings);
      } catch {
        timings = [];
      }
    }

    // -----------------------------
    // 🔹 Parse and calculate start/end time
    // -----------------------------
    let dbStartTime = null;
    let dbEndTime = null;

    if (start_time) {
      const parsedStart = moment(start_time, "DD-MM-YYYY", true);
      if (!parsedStart.isValid()) {
        return res.status(400).json({
          status: false,
          message: "Invalid start_time format. Expected DD-MM-YYYY.",
        });
      }

      dbStartTime = parsedStart.format("YYYY-MM-DD");

      if (duration && duration.includes("Week")) {
        const weeks = parseInt(duration);
        dbEndTime = parsedStart.clone().add(weeks, "weeks").format("YYYY-MM-DD");
      } else if (duration === "Ongoing Until Review") {
        dbEndTime = null;
      }
    }

    // -----------------------------
    // 🔹 Prepare data object
    // -----------------------------
    const prescriptionData = {
      staff_id,
      product_id,
      client_id,
      dosage,
      when_to_use: whenToUse,
      when_to_start: whenToStart,
      when_to_stop: whenToStop,
      duration,
      frequency,
      intake_mode: intakeMode,
      timings,
      time_option,
      start_time: dbStartTime,
      end_time: dbEndTime,
      special_instraction,
    };

    // -----------------------------
    // 🔹 Fetch existing record
    // -----------------------------
    const existingPrescription = await ProductPrescriptions.findOne({
      where: { product_id, client_id },
      raw: true,
    });

    // -----------------------------
    // 🧠 If existing record found, compare fields
    // -----------------------------
    if (existingPrescription) {
      const keysToCompare = [
        "dosage",
        "when_to_use",
        "when_to_start",
        "when_to_stop",
        "duration",
        "frequency",
        "intake_mode",
        "timings",
        "time_option",
        "start_time",
        "end_time",
        "special_instraction",
      ];

      const normalizeValue = (val) => {
        if (val === null || val === undefined) return null;
        if (typeof val === "string") {
          try {
            const parsed = JSON.parse(val);
            return parsed;
          } catch {
            return val.trim();
          }
        }
        return val;
      };

      let hasChanges = false;

      for (const key of keysToCompare) {
        const oldVal = normalizeValue(existingPrescription[key]);
        const newVal = normalizeValue(prescriptionData[key]);

        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          hasChanges = true;
          console.log(`⚠ Change detected in "${key}":`, oldVal, "→", newVal);
          break;
        }
      }

      // -----------------------------
      // 🚫 No changes detected
      // -----------------------------
      if (!hasChanges) {
        return res.status(200).json({
          status: true,
          message: "No changes detected. Prescription remains unchanged.",
          prescription: existingPrescription,
        });
      }

      // -----------------------------
      // ✅ Changes found → create NEW entry
      // -----------------------------
      const newPrescription = await ProductPrescriptions.create(prescriptionData);

      // 🔔 Send notification
      await sendPrescriptionEditNotification(edit_id, staff_id);

      return res.status(201).json({
        status: true,
        message: "Changes detected. New prescription version created successfully.",
        prescription: newPrescription,
      });
    }

    // -----------------------------
    // 🆕 No existing record → create new
    // -----------------------------
    const newPrescription = await ProductPrescriptions.create(prescriptionData);

    return res.status(201).json({
      status: true,
      message: "Prescription created successfully.",
      prescription: newPrescription,
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
          body: `${staffUser.full_name} has updated the Product Prescriptions.`,
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


// exports.treatmentProducts = async (req, res) => {
//   try {
//     // 🔐 Token validation
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return res.status(401).json({ message: "Authentication token is required." });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
//     const client_id = decoded.id;

//     const { date, treatment_id } = req.body;

//     // ✅ Base where condition for Products
//     const whereCondition = {};

//     // 🧠 ProductPrescriptions se product_ids nikalna
//     let clientProductIds = [];
//     if (client_id) {
//       const presWhere = { client_id };

//       // 👇 Date filter
//       if (date) {
//         presWhere.start_time = { [Op.lte]: date };
//         presWhere.end_time = { [Op.gte]: date };
//       }

//       // 👇 treatment_id filter
//       if (treatment_id) {
//         presWhere.treatment_id = Array.isArray(treatment_id)
//           ? { [Op.in]: treatment_id }
//           : treatment_id;
//       }

//       const prescriptions = await ProductPrescriptions.findAll({
//         where: presWhere,
//         attributes: ["product_id"],
//         raw: true,
//       });

//       clientProductIds = prescriptions.map((p) => p.product_id);

//       if (clientProductIds.length > 0) {
//         whereCondition.id = { [Op.in]: clientProductIds };
//       } else {
//         return res.status(200).json({
//           status: true,
//           message: "No products found for this client",
//           data: [],
//         });
//       }
//     }

//     // 🛍️ Products fetch karo
//     const products = await Products.findAll({
//       where: whereCondition,
//       include: [
//         {
//           model: ProductImages,
//           as: "images",
//           attributes: ["id", "image_url", "alt_text", "sort_order"],
//         },
//         {
//           model: ProductPrescriptions,
//           as: "prescription",
//           attributes: [
//             "dosage",
//             "when_to_use",
//             "when_to_start",
//             "when_to_stop",
//             "time_option",
//             "start_time",
//             "end_time",
//             "duration",
//             "frequency",
//             "intake_mode",
//             "special_instraction",
//             "timings",
//           ],
//           where: {
//             client_id,
//             ...(date && {
//               start_time: { [Op.lte]: date },
//               end_time: { [Op.gte]: date },
//             }),
//             ...(treatment_id && {
//               treatment_id: Array.isArray(treatment_id)
//                 ? { [Op.in]: treatment_id }
//                 : treatment_id,
//             }),
//           },
//           required: false,
//         },
//       ],
//       order: [["id", "DESC"]],
//     });

//     // 🧾 Format Products
//     const formatted = await Promise.all(
//       products.map(async (p) => {
//         const prod = p.toJSON();

//         // 🏥 Clinic name & address from User model
//         if (prod.clinic_id) {
//           const clinicRecord = await User.findOne({
//             where: { id: prod.clinic_id },
//             attributes: ["id", "clinic_name", "address"],
//             raw: true,
//           });

//           prod.clinic_name = clinicRecord ? clinicRecord.clinic_name : null;
//           prod.clinic_address = clinicRecord ? clinicRecord.address : null;
//         } else {
//           prod.clinic_name = null;
//           prod.clinic_address = null;
//         }

//         // 📦 Categories
//         const categoryIds = Array.isArray(prod.service_categories)
//           ? prod.service_categories
//           : JSON.parse(prod.service_categories || "[]");
//         const treatmentIds = Array.isArray(prod.treatments)
//           ? prod.treatments
//           : JSON.parse(prod.treatments || "[]");

//         const categories = await Category.findAll({
//           where: { id: categoryIds },
//           attributes: ["id", "title", "image"],
//         });

//         const services = await Service.findAll({
//           where: { id: treatmentIds },
//           attributes: ["id", "name"],
//         });

//         // 🧪 Dosage list
//         const typeRecord = await ProductMeta.findOne({
//           where: { title: prod.type },
//           attributes: ["id"],
//         });

//         const metaOptions = await Productmetaoption.findAll({
//           where: { meta_id: typeRecord?.id },
//           attributes: ["id", "title"],
//         });

//         prod.service_categories = categories;
//         prod.treatments = services;
//         prod.dosagelist = metaOptions;

//         // 💊 Prescription override
//         if (prod.prescription) {
//           const pres = prod.prescription;
//           prod.dosage = pres.dosage;
//           prod.frequency = pres.frequency;
//           prod.intake_mode = pres.intake_mode;
//           prod.special_instraction = pres.special_instraction;
//           prod.when_to_use = pres.when_to_use;
//           prod.when_to_start = pres.when_to_start;
//           prod.when_to_stop = pres.when_to_stop;
//           prod.duration = pres.duration;
//           prod.start_time = pres.start_time;
//           prod.end_time = pres.end_time;
//         }

//         prod.status = 0;
//         delete prod.prescription;
//         return prod;
//       })
//     );

//     return res.status(200).json({
//       status: true,
//       message: "Product list fetched successfully",
//       data: formatted,
//     });
//   } catch (err) {
//     console.error("Get Products Error:", err);
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: process.env.NODE_ENV !== "production" ? err.message : undefined,
//     });
//   }
// };


exports.treatmentProducts = async (req, res) => {
  try {
    // 🔐 Validate Token
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Authentication token is required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const user_id = decoded.id;

    console.log("📅 user_id:", user_id);

    let { date, treatment_id } = req.body;

    // ✅ Format and validate date
    let formattedDate = null;
    if (date) {
      const parsed = moment(date, "DD-MM-YYYY", true);
      if (!parsed.isValid()) {
        return res.status(400).json({
          status: false,
          message: "Invalid date format. Expected DD-MM-YYYY.",
        });
      }
      formattedDate = parsed.format("YYYY-MM-DD"); // ✅ for SQL
      console.log("📅 formattedDate:", formattedDate);
    }

    // ✅ For single client, just use user_id
    const client_id = user_id;
    console.log("✅ client_id:", client_id);

    // 🧠 Build prescription filter
    const presWhere = { client_id }; // ✅ equality for single client
    if (formattedDate) {
      presWhere.start_time = { [Op.lte]: formattedDate };
      presWhere.end_time = { [Op.gte]: formattedDate };
    }
    if (treatment_id) {
      presWhere.treatment_id = Array.isArray(treatment_id)
        ? { [Op.in]: treatment_id }
        : treatment_id;
    }

    // 🔍 Get product IDs from prescriptions
    const prescriptions = await ProductPrescriptions.findAll({
      where: presWhere,
      attributes: ["product_id"],
      raw: true,
    });

    const clientProductIds = prescriptions.map((p) => p.product_id);
    if (!clientProductIds.length) {
      return res.status(200).json({
        status: true,
        message: "No products found for this client/date range.",
        data: [],
      });
    }

    console.log("✅ clientProductIds:", clientProductIds);

    // 🛍️ Fetch products with relations
    const products = await Products.findAll({
      where: { id: { [Op.in]: clientProductIds } },
      include: [
        {
          model: ProductImages,
          as: "images",
          attributes: ["id", "image_url", "alt_text", "sort_order"],
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
            "treatment_id",
            "timings",
          ],
          where: {
            client_id, // ✅ single client
            ...(formattedDate && {
              start_time: { [Op.lte]: formattedDate },
              end_time: { [Op.gte]: formattedDate },
            }),
            ...(treatment_id && {
              treatment_id: Array.isArray(treatment_id)
                ? { [Op.in]: treatment_id }
                : treatment_id,
            }),
          },
          required: false,
        },
      ],
      order: [["id", "DESC"]],
    });

    // 🧾 Format response
    const formatted = await Promise.all(
      products.map(async (product) => {
        const prod = product.toJSON();

        // 🏥 Clinic Info
        if (prod.clinic_id) {
          const clinic = await User.findOne({
            where: { id: prod.clinic_id },
            attributes: ["id", "clinic_name", "address"],
            raw: true,
          });
          prod.clinic_name = clinic?.clinic_name || null;
          prod.clinic_address = clinic?.address || null;
        } else {
          prod.clinic_name = null;
          prod.clinic_address = null;
        }

        // 🏷️ Parse Categories & Treatments
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

        // 💊 Get Dosage Options
        const typeRecord = await ProductMeta.findOne({
          where: { title: prod.type },
          attributes: ["id"],
          raw: true,
        });

        const metaOptions = typeRecord
          ? await Productmetaoption.findAll({
              where: { meta_id: typeRecord.id },
              attributes: ["id", "title"],
              raw: true,
            })
          : [];

        prod.dosagelist = metaOptions;

        // 💊 Merge prescription data
        if (prod.prescription) {
          Object.assign(prod, {
            dosage: prod.prescription.dosage,
            frequency: prod.prescription.frequency,
            intake_mode: prod.prescription.intake_mode,
            special_instraction: prod.prescription.special_instraction,
            when_to_use: prod.prescription.when_to_use,
            when_to_start: prod.prescription.when_to_start,
            when_to_stop: prod.prescription.when_to_stop,
            duration: prod.prescription.duration,
            start_time: prod.prescription.start_time,
            end_time: prod.prescription.end_time,
            treatment_id: prod.prescription.treatment_id,
          });
        }

        // 📆 Check if product is used in history for given date
        if (formattedDate && prod.id && prod.treatment_id) {
          const existingHistory = await TreatmentProductsHistory.findOne({
            where: {
              product_id: prod.id,
              treatment_id: prod.treatment_id,
              date: formattedDate, // ✅ simple equality for DATE column
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
      data: formatted,
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