const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Service = require('@models/Service');
const Category = require('@models/Category');
const User = require('@models/User');


exports.getServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [{ model: Category, as: "category" }],
      order: [['createdAt', 'DESC']], // 🔥 Latest services at top
    });

    res.json({ data: services });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

// ✅ Create service
exports.createService = async (req, res) => {
  try {
    const { name, category_id,description,postcare,precare } = req.body;
    if (!name || !category_id) {
      return res.status(400).json({ error: "Name and Category are required" });
    }

    const service = await Service.create({ name, category_id,description,postcare,precare });
    res.json({ message: "Service created", data: service });
  } catch (error) {
    res.status(500).json({ error: "Failed to create service" });
  }
};

// ✅ Update service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id,description,postcare,precare } = req.body;

    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ error: "Service not found" });

    await service.update({ name, category_id,description,postcare,precare });
    res.json({ message: "Service updated", data: service });
  } catch (error) {
    res.status(500).json({ error: "Failed to update service" });
  }
};

// ✅ Delete service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ error: "Service not found" });

    await service.destroy();
    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete service" });
  }
};

exports.ClinicDetails = async (req, res) => {
    try {
          const { id } = req.params;
    const user = await User.findOne({ where: { id: id } });
    if (!user) return res.status(404).json({ error: "Clinic not found" });
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

