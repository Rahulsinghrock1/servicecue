require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Progress = require('@models/Progress');
const ProgressImage = require('@models/ProgressImage');
const ProgressComments = require('@models/ProgressComments');
const User = require('@models/User');
const nodemailer = require('nodemailer');
const uploadProfilePic = require("@helpers/imageUpload");
const { getUserDetails } = require('@helpers/commonHelper');
const TreatmentPlan  = require('@models/TreatmentPlan');
const Treatment = require('@models/Treatment');




exports.createOrUpdate = async (req, res) => {
  try {
    // ✅ Step 1: Handle file upload (multer) as a promise
    await new Promise((resolve, reject) => {
      uploadProfilePic(req, res, (err) => (err ? reject(err) : resolve()));
    });

    // ✅ Step 2: Extract fields from request body
    let { edit_id, comments, treatment_id, user_id, clinic_id } = req.body;

    // ✅ Step 3: Basic validation
    if (!comments || !treatment_id || !clinic_id || !user_id) {
      return res.status(400).json({
        status: false,
        message: "All required fields must be filled.",
      });
    }

    console.log("Files:", req.files);
    console.log("Body:", req.body);

    // ✅ Step 4: Handle uploaded images (use correct folder)
    const progressImages = req.files?.progress_images
      ? req.files.progress_images.map((file) => `/uploads/progress/${file.filename}`)
      : [];

    if (!edit_id && progressImages.length === 0) {
      return res.status(400).json({
        status: false,
        message: "At least one image must be uploaded for new entries.",
      });
    }

    let progress;

    // ============================================
    // UPDATE CASE
    // ============================================
    if (edit_id) {
      progress = await Progress.findByPk(edit_id);
      if (!progress) {
        return res.status(404).json({
          status: false,
          message: "Progress record not found.",
        });
      }

      // update main progress
      progress.treatment_id = treatment_id;
      progress.clinic_id = clinic_id;
      progress.user_id = user_id;
      await progress.save();

      // update images if new uploaded
      if (progressImages.length > 0) {
        await ProgressImage.destroy({ where: { progress_id: edit_id } });

        const imageData = progressImages.map((path) => ({
          progress_id: edit_id,
          image: path,
          user_id: user_id,
        }));
        await ProgressImage.bulkCreate(imageData);
      }

      // always add new comment
      await ProgressComments.create({
        progress_id: edit_id,
        comments: comments,
        user_id: user_id,
      });

      return res.status(200).json({
        status: true,
        message: "Progress updated successfully.",
      });
    }

    // ============================================
    // CREATE CASE
    // ============================================
    progress = await Progress.create({
      treatment_id,
      clinic_id,
      user_id,
    });

    // save images
    if (progressImages.length > 0) {
      const imageData = progressImages.map((path) => ({
        progress_id: progress.id,
        image: path,
        user_id: user_id,
      }));
      await ProgressImage.bulkCreate(imageData);
    }

    // save comment
    await ProgressComments.create({
      progress_id: progress.id,
      comments: comments,
      user_id: user_id,
    });

    return res.status(201).json({
      status: true,
      message: "Progress created successfully.",
    });

  } catch (err) {
    console.error("Progress Create/Update Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};




exports.getComments = async (req, res) => {
  try {
    const { treatment_id } = req.body;

    if (!treatment_id) {
      return res.status(400).json({
        status: false,
        message: "treatment_id is required.",
      });
    }

    // Fetch progress records
    const progressEntries = await Progress.findAll({
      where: { treatment_id },
      order: [['created_at', 'ASC']],
      include: [
        {
          model: ProgressImage,
          as: 'images',
          attributes: ['image']
        },
        {
          model: ProgressComments,
          as: 'comments',
          attributes: ['id', 'comments', 'user_id', ['created_at', 'createdAt']],
          order: [['created_at', 'ASC']],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'full_name', 'avatar']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['full_name','avatar']
        }
      ]
    });

    if (!progressEntries.length) {
      return res.status(404).json({
        status: false,
        message: "No progress entries found for this treatment.",
      });
    }

    // Get the first progress date
    const firstProgressDate = new Date(progressEntries[0].createdAt);

    // Fetch latest treatment plan for the client
    const latestTreatment = await Treatment.findOne({
      where: { id: treatment_id },
      order: [["id", "DESC"]],
      attributes: ["id", "client_id","concerns",  "front", "left", "right", "created_at"]
    });



    // Prepare before_images array
    const beforeImages = [];
    if (latestTreatment) {
      console.log("hello");
      console.log(latestTreatment.front);
      console.log(latestTreatment.left);
      console.log(latestTreatment.right);
      if (latestTreatment.front) beforeImages.push({ image_url: latestTreatment.front, created_at: latestTreatment.created_at });
      if (latestTreatment.left) beforeImages.push({ image_url: latestTreatment.left, created_at: latestTreatment.created_at });
      if (latestTreatment.right) beforeImages.push({ image_url: latestTreatment.right, created_at: latestTreatment.created_at });
    }

    // Calculate week difference from treatment creation to first progress
    function getWeekDifference(fromDate, toDate) {
      const diffMs = new Date(toDate) - new Date(fromDate);
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return Math.floor(diffDays / 7);
    }

    function formatDate(dateInput) {
      const date = new Date(dateInput);
      if (!dateInput || isNaN(date.getTime())) return 'Invalid Date';
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    }
    const differenceFromTreatment = latestTreatment
      ? getWeekDifference(latestTreatment.dataValues.created_at, firstProgressDate)
      : 0;

    // Format progress entries
    const formatted = progressEntries.map((entry, index) => {
      return {
        progress_id: entry.id,
        user_name: entry.user?.full_name || 'Unknown',
        avatar: entry.user?.avatar || 'Unknown',
        treatment_date: formatDate(entry.createdAt),
difference_from_first_entry: `Uploaded after ${differenceFromTreatment} week${differenceFromTreatment !== 1 ? 's' : ''} of treatment`,

        images: entry.images.map(img => ({ image_url: img.image })),
        comments: entry.comments.map(c => ({
          comment_id: c.id,
          comment_text: c.comments,
          user_id: c.user_id,
          date: formatDate(c.createdAt),
          user: {
            id: c.user?.id || null,
            full_name: c.user?.full_name || 'Unknown',
            avatar: c.user?.avatar || null
          }
        }))
      };
    });

    return res.status(200).json({
      status: true,
      message: "Progress data fetched successfully.",
      before_images: beforeImages,
      data: formatted
    });

  } catch (err) {
    console.error("Fetch Comments Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};



exports.editComment = async (req, res) => {
  try {
    const { comment_id, comment } = req.body;

    // Validation
    if (!comment_id || !comment) {
      return res.status(400).json({
        status: false,
        message: "comment_id and comment are required.",
      });
    }

    // Find comment by ID
    const existingComment = await ProgressComments.findOne({ where: { id: comment_id } });

    if (!existingComment) {
      return res.status(404).json({
        status: false,
        message: "Comment not found.",
      });
    }

    // Update comment text
    existingComment.comments = comment;
    await existingComment.save();

    return res.status(200).json({
      status: true,
      message: "Comment updated successfully.",
    });

  } catch (err) {
    console.error("Edit Comment Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};


exports.addComment = async (req, res) => {
  try {
    const { progress_id, comment, user_id, edit_id } = req.body;

    // Validation
    if (!progress_id || !comment || !user_id) {
      return res.status(400).json({
        status: false,
        message: "progress_id, comment, and user_id are required.",
      });
    }

    // Get user's role
    const user = await User.findOne({ where: { id: user_id } }); // replace 'Users' with your actual user model

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
      });
    }

    const userRoleId = user.user_role_id;

    // Check comment limit for EO (1) and DEO (2)
    const existingCommentsCount = await ProgressComments.count({
      where: {
        progress_id,
        user_id,
      },
    });

    const commentLimit = userRoleId === 1 ? 1 : userRoleId === 2 ? 2 : Infinity;

    if (!edit_id && existingCommentsCount >= commentLimit) {
      return res.status(400).json({
        status: false,
        message: "You have reached your comment limit.",
      });
    }

    // If edit_id is provided, update existing comment
    if (edit_id) {
      const existingComment = await ProgressComments.findOne({ where: { id: edit_id } });

      if (!existingComment) {
        return res.status(404).json({
          status: false,
          message: "Comment not found.",
        });
      }

      existingComment.comments = comment;
      await existingComment.save();

      return res.status(200).json({
        status: true,
        message: "Comment updated successfully.",
        data: existingComment,
      });
    }

    // Otherwise, create new comment
    const newComment = await ProgressComments.create({
      progress_id,
      comments: comment,
      user_id,
    });

    return res.status(201).json({
      status: true,
      message: "Comment added successfully.",
      data: newComment,
    });

  } catch (err) {
    console.error("Add/Update Comment Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};







