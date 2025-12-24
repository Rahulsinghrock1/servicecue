const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Service = require('@models/Service');
const Category = require('@models/Category');
const path = require("path");



exports.create = async (req, res) => {
    try {
        const { title, description } = req.body;
        let imagePath = null;

        if (req.file) {
            imagePath = `uploads/categories/${req.file.filename}`;
        }

        const category = await Category.create({
            title,
            description,
            image: imagePath,
        });

        return res.json({ success: true, message: "Category created", data: category });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed to create category" });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        let imagePath = category.image;
        if (req.file) {
            imagePath = `uploads/categories/${req.file.filename}`;
        }

        await category.update({
            title,
            description,
            image: imagePath,
        });

        return res.json({ success: true, message: "Category updated", data: category });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed to update category" });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        await category.destroy();
        return res.json({ success: true, message: "Category deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed to delete category" });
    }
};

