const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Service = require('@models/Service');
const Category = require('@models/Category');
const ClinicServices = require('@models/ClinicServices');
const ClinicPortfolio = require('@models/ClinicPortfolio');
const ClinicOperational = require('@models/ClinicOperational');
const ClinicInstructions = require('@models/ClinicInstructions');

// ✅ Create service
exports.SaveClinicServices = async (req, res) => {
  try {
    const { services } = req.body;

    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ error: "Services data is required" });
    }

    const clinicId = services[0].clinic_id; // मान रहे हैं कि सारे services एक ही clinic के हैं
    if (!clinicId) {
      return res.status(400).json({ error: "clinic_id is required" });
    }

    // 🧹 Step 1: पुराने records delete कर दो
    await ClinicServices.destroy({
      where: { clinic_id: clinicId },
    });

    // 🆕 Step 2: Insert केवल category_id, subcategory_id, clinic_id (id मत दो)
    const cleanedServices = services.map((s) => ({
      category_id: s.category_id,
      subcategory_id: s.subcategory_id,
      clinic_id: clinicId,
    }));

    const saved = await ClinicServices.bulkCreate(cleanedServices);

    return res.status(200).json({
      message: "Clinic services saved successfully",
      data: saved,
    });
  } catch (error) {
    console.error("SaveClinicServices Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.GetClinicServices = async (req, res) => {
  try {
    const { clinic_id } = req.body;
    if (!clinic_id) {
      return res.status(400).json({ error: "clinic_id is required" });
    }
    const savedServices = await ClinicServices.findAll({
      where: { clinic_id },
    });
    return res.status(200).json({
      message: "Saved services fetched successfully",
      data: savedServices,
    });
  } catch (error) {
    console.error("GetClinicServices Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.SaveClinicPortfolio = async (req, res) => {
  try {
    const { clinic_id } = req.body;

    if (!clinic_id) {
      return res.status(400).json({ error: "clinic_id is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    // files से path निकालो
    const images = req.files.map((file) => ({
      clinic_id,
      image_url: "/uploads/portfolio/" + file.filename,
    }));

    // Bulk insert
    const savedImages = await ClinicPortfolio.bulkCreate(images);

    return res.status(200).json({
      message: "Clinic portfolio saved successfully",
      data: savedImages,
    });
  } catch (error) {
    console.error("SaveClinicPortfolio Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.GetClinicPortfolio = async (req, res) => {
  try {
    const { clinic_id } = req.body;

    if (!clinic_id) {
      return res.status(400).json({ error: "clinic_id is required" });
    }

    const portfolio = await ClinicPortfolio.findAll({
      where: { clinic_id },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      message: "Clinic portfolio fetched successfully",
      data: portfolio,
    });
  } catch (error) {
    console.error("GetClinicPortfolio Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.DeleteClinicPortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolio = await ClinicPortfolio.findByPk(id);
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

exports.SaveClinicOperational = async (req, res) => {
  try {
    const { clinic_id, workingDays, breaks } = req.body;

    if (!clinic_id) {
      return res.status(400).json({ error: "clinic_id is required" });
    }

    // delete old data first (if updating)
    await ClinicOperational.destroy({ where: { clinic_id } });

    // Save new records
    const payload = workingDays.map((day) => ({
      clinic_id,
      type: "workingDay",
      label: day.day,
      active: day.active,
      from: day.from,
      to: day.to,
    }));

    breaks.forEach((br) => {
      payload.push({
        clinic_id,
        type: "break",
        label: br.name,
        active: true,
        from: br.from,
        to: br.to,
      });
    });

    const saved = await ClinicOperational.bulkCreate(payload);

    return res.status(200).json({
      message: "Clinic operational details saved successfully",
      data: saved,
    });
  } catch (error) {
    console.error("SaveClinicOperational Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get
exports.GetClinicOperational = async (req, res) => {
  try {
    const { clinic_id } = req.body;

    if (!clinic_id) {
      return res.status(400).json({ error: "clinic_id is required" });
    }

    const details = await ClinicOperational.findAll({
      where: { clinic_id },
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      message: "Clinic operational details fetched successfully",
      data: details,
    });
  } catch (error) {
    console.error("GetClinicOperational Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete
exports.DeleteClinicOperational = async (req, res) => {
  try {
    const { clinic_id } = req.params;

    await ClinicOperational.destroy({ where: { clinic_id } });

    return res.status(200).json({ message: "Clinic operational details deleted" });
  } catch (error) {
    console.error("DeleteClinicOperational Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



   exports.AddClinicTreatment = async (req, res) => {
  try {
    const { clinic_id, category_id, treatments } = req.body;

    // Basic validation
    if (!clinic_id || !category_id || !Array.isArray(treatments)) {
      return res.status(400).json({ error: "Missing or invalid data" });
    }

    // Filter and prepare valid treatments
    const payload = treatments
      .filter((t) => t.name && t.name.trim())
      .map((t) => ({
        created_by: clinic_id || "",
        category_id,
        name: t.name.trim(),
        precare: t.pre_instruction || "",
        postcare: t.post_instruction || "",
      }));

    if (!payload.length) {
      return res.status(400).json({ error: "No valid treatments provided" });
    }

    // Bulk insert using Sequelize
    await Service.bulkCreate(payload);

    return res.status(200).json({
      message: "Treatments saved successfully",
      count: payload.length,
    });
  } catch (error) {
    console.error("AddClinicTreatmentsBulk Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


   exports.SaveClinicServiceInstructions = async (req, res) => {
  try {
    const {
      clinic_id,
      category_id,
      subcategory_id, // this is service_id
      name,
      pre_instruction,
      post_instruction,
    } = req.body;

    if (!clinic_id || !category_id || !subcategory_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Step 1: Fetch existing service
    const existingService = await Service.findOne({
      where: { id: subcategory_id, category_id },
    });

    if (!existingService) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Step 2: If clinic is owner, update in Service table
    if (Number(existingService.created_by) === Number(clinic_id)) {
      await Service.update(
        {
          name: name || existingService.name,
          precare: pre_instruction || "",
          postcare: post_instruction || "",
        },
        {
          where: { id: subcategory_id },
        }
      );

      return res.status(200).json({
        message: "Instructions updated successfully in Service",
        updated_in: "Service",
      });
    }

    // Step 3: Check for existing ClinicInstructions
    const existingClinicInstruction = await ClinicInstructions.findOne({
      where: {
        clinic_id,
        service_id: subcategory_id,
      },
    });

    if (existingClinicInstruction) {
      // ✅ Update existing ClinicInstructions
      await ClinicInstructions.update(
        {
          precare: pre_instruction || "",
          postcare: post_instruction || "",
        },
        {
          where: {
            clinic_id,
            service_id: subcategory_id,
          },
        }
      );

      return res.status(200).json({
        message: "Instructions updated in ClinicInstructions",
        updated_in: "ClinicInstructions",
      });
    }

    // Step 4: Create new ClinicInstructions
    await ClinicInstructions.create({
      clinic_id,
      service_id: subcategory_id,
      precare: pre_instruction || "",
      postcare: post_instruction || "",
    });

    return res.status(200).json({
      message: "Instructions saved for this clinic",
      saved_in: "ClinicInstructions",
    });
  } catch (error) {
    console.error("SaveClinicServiceInstructions Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.ClinicServiceInstructions = async (req, res) => {
  try {
    const { clinic_id, service_id } = req.body;

    const filters = {
      clinic_id,
      service_id,
    };

    const instructions = await ClinicInstructions.findAll({
      where: filters,
      raw: true,
    });

    return res.status(200).json({
      message: "Clinic instructions fetched successfully",
      data: instructions,
    });
  } catch (error) {
    console.error("ClinicServiceInstructions Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};