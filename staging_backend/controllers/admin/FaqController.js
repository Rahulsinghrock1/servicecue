const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Faq = require('@models/Faq');

exports.addFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ success: false, message: "Question and Answer are required" });
    }

    const faq = await Faq.create({ question, answer });

    return res.status(201).json({ success: true, message: "FAQ created successfully", data: faq });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Edit FAQ
exports.editFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    const faq = await Faq.findByPk(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    await faq.save();

    return res.status(200).json({ success: true, message: "FAQ updated successfully", data: faq });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Delete FAQ
exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await Faq.findByPk(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    await faq.destroy();
    return res.status(200).json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

