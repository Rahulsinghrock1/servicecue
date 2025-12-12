const User = require('@models/User');
const Products = require('@models/Products');
const ProductImages = require('@models/ProductImages');
const { Sequelize } = require('sequelize');
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");



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





exports.SaveOrUpdateProduct = async (req, res) => {
  try {
    let {
      id, // Optional: if present = update
      title,
      brand,
      type,
      weight,
      description,
      highlights,
      usage,
      ingredients,
      dosage,
      treatmentPhase,
      whenToUse,
      whenToStart,
      whenToStop,
      duration,
      frequency,
      intakeMode,
      whenToResume,
      size,
      sizeUnit,
      timings,
      categories,
      treatments,
      price,
      sale_price,
      clinic_id, // Make sure this is passed or derived from token/session
    } = req.body;

    // --- VALIDATIONS ---

    if (!title || !clinic_id) {
      return res.status(400).json({
        status: false,
        message: "Product title and clinic ID are required.",
      });
    }

    // Parse JSON fields (in case sent as strings)
    categories = typeof categories === "string" ? JSON.parse(categories) : categories;
    treatments = typeof treatments === "string" ? JSON.parse(treatments) : treatments;
    timings = typeof timings === "string" ? JSON.parse(timings) : timings;

    // Prevent duplicate product names for same clinic (case-insensitive)
    const existingProduct = await Products.findOne({
      where: {
        clinic_id,
        title: title.trim(),
        ...(id && { id: { [Op.ne]: id } }), // Exclude self when updating
      },
    });

    if (existingProduct) {
      return res.status(409).json({
        status: false,
        message: "A product with the same title already exists in this clinic.",
      });
    }

    // --- PREPARE DATA ---

    const productData = {
      clinic_id,
      title: title.trim(),
      brand,
      type,
      weight,
      size,
      size_unit: sizeUnit,
      timings,
      description,
      highlights,
      usage,
      ingredients,
      dosage,
      when_to_use: treatmentPhase,
      when_to_start: whenToStart,
      when_to_stop: whenToStop,
      duration,
      frequency,
      intake_mode: intakeMode,
      time_option:whenToResume,
      service_categories: categories,
      treatments,
      price,
      sale_price,
    };

    let product;

    // --- UPDATE PRODUCT ---
    if (id) {
      product = await Products.findByPk(id);

      if (!product) {
        return res.status(404).json({
          status: false,
          message: "Product not found.",
        });
      }

      await product.update(productData);

      // Optional: Handle image upload
      if (req.files?.images?.length > 0) {
        const imagesData = req.files.images.map((file, index) => ({
          product_id: product.id,
          image_url: `/uploads/products/${file.filename}`,
          sort_order: index + 1,
        }));
        await ProductImages.bulkCreate(imagesData);
      }

      return res.status(200).json({
        status: true,
        message: "Product updated successfully.",
        product,
      });
    }

    // --- CREATE NEW PRODUCT ---
    product = await Products.create(productData);

    if (req.files?.images?.length > 0) {
      const imagesData = req.files.images.map((file, index) => ({
        product_id: product.id,
        image_url: `/uploads/products/${file.filename}`,
        sort_order: index + 1,
      }));
      await ProductImages.bulkCreate(imagesData);
    }

    return res.status(201).json({
      status: true,
      message: "Product created successfully.",
      product,
    });
  } catch (err) {
    console.error("❌ SaveOrUpdateProduct Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};




exports.toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Pehle user find karo
        const user = await Products.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Products not found' });
        }

        // Status toggle karo
        user.status = !user.status;
        await user.save();

        return res.status(200).json({
            message: `Products ${user.status ? 'Active' : 'Deactive'} successfully!`,
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







