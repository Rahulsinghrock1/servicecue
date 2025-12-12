require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SplashScreens = require('@models/SplashScreens');
const CategoryModel  = require('@models/Category');
const ProductCategory  = require('@models/ProductCategory');
const ServiceModel  = require('@models/Service');
const SendEnquiry = require('@models/SendEnquiry');
const Specialists = require('@models/Specialists');
const ClinicServices = require("@models/ClinicServices");
const Faq = require('@models/Faq');
const Page = require("@models/Page");
const User = require('@models/User');
const Client = require('@models/Client');
const validator = require("validator");
const { Sequelize, Op } = require("sequelize");
const nodemailer = require('nodemailer');
const ProductMeta = require("@models/ProductMeta");
const Product = require("@models/Products");
const Productmetaoption = require("@models/Productmetaoption");
const APP_URL = process.env.APP_URL || "http://localhost:5000"; // base URL for images
const Treatment = require('@models/Treatment');
const Notifications = require('@models/Notifications');
const TreatmentPlan  = require('@models/TreatmentPlan');
const TreatmentProductsRepurchase = require('@models/TreatmentProductsRepurchase');
const TreatmentProduct = require('@models/TreatmentProducts');
const AssignClient = require('@models/AssignClient');
const Subscription = require("@models/Subscription");
const SubscriptionPlans = require("@models/SubscriptionPlans");


// Splash Screen 
exports.SplashScreens = async (req, res) => {
    try {
        const splashScreens = await SplashScreens.findAll();

        const baseUrl = process.env.BASE_PATH.endsWith('/')
            ? process.env.BASE_PATH
            : process.env.BASE_PATH + '/';

        const updatedScreens = splashScreens.map(screen => {
            const imagePath = screen.image.startsWith('http')
                ? screen.image
                : baseUrl + screen.image;

            return {
                ...screen.toJSON(),
                image: imagePath,
            };
        });

        return res.status(200).json({
            message: 'List fetched successfully!',
            data: updatedScreens,
        });
    } catch (error) {
        console.error('Error fetching splash screens:', error);
        return res.status(500).json({
            message: 'Something went wrong!',
            error: error.message,
        });
    }
};
exports.Users = async (req, res) => {
  try {
    const { user_role_id = "", created_by = "" } = req.body;

    let whereCondition = {};

    if (created_by) {
      whereCondition.created_by = created_by;
    } else if (user_role_id) {
      whereCondition.user_role_id = user_role_id;
    }

    // Step 1: Fetch all users
    const users = await User.findAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
    });

    // Step 2: For each user, fetch subscription based on user_id
    const usersWithSubs = await Promise.all(
      users.map(async (user) => {
        const subscription = await Subscription.findOne({
          where: { user_id: user.id },
        });

        return {
          ...user.toJSON(),
          subscription: subscription ? subscription.toJSON() : null,
        };
      })
    );

    return res.status(200).json({
      message: "List fetched successfully!",
      data: usersWithSubs,
      filters: { user_role_id, created_by },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};


// Category List 
exports.Category = async (req, res) => {
  try {
    const { name = "" } = req.body;

    const categories = await CategoryModel.findAll({
      order: [["createdAt", "DESC"]],
    });

    const baseUrl = process.env.BASE_PATH.endsWith("/")
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.NEXT_PUBLIC_APP_URL + "/";

    const updatedCategories = await Promise.all(
      categories.map(async (category) => {
        const imagePath = category.image?.startsWith("http")
          ? category.image
          : baseUrl + category.image;

        // ✅ Fix: DISTINCT User.id
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
          col: "id", // ✅ just "id", not "User.id"
        });

        return {
          ...category.toJSON(),
          image: imagePath,
          total_clinic: totalClinic,
        };
      })
    );

    const filteredCategories = name
      ? updatedCategories.filter((item) =>
          item.title.toLowerCase().includes(name.toLowerCase())
        )
      : updatedCategories;

    return res.status(200).json({
      message: "List fetched successfully!",
      data: filteredCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};


exports.ProductCategory = async (req, res) => {
  try {
    const { name = "" } = req.body;

    // 📌 Fetch all categories
    const categories = await ProductCategory.findAll({
      order: [["createdAt", "DESC"]],
    });

    // 📌 Base URL fix
    const baseUrl = process.env.BASE_PATH?.endsWith("/")
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.NEXT_PUBLIC_APP_URL + "/";

    // 📌 Add full image path
    const updatedCategories = categories.map((category) => {
      const imagePath = category.image?.startsWith("http")
        ? category.image
        : baseUrl + category.image;

      return {
        ...category.toJSON(),
        image: imagePath,
      };
    });

    // 📌 Name filter (if provided)
    const filteredCategories = name
      ? updatedCategories.filter((item) =>
          item.title.toLowerCase().includes(name.toLowerCase())
        )
      : updatedCategories;

    return res.status(200).json({
      message: "List fetched successfully!",
      data: filteredCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};



exports.sendEnquiry = async (req, res) => {
  try {
    const { name, phone, email, service, message, clinic_id } = req.body;
    const user_id = req.user?.id || null;

    // ✅ Validation
if (!name || name.trim() === '') {
  return res.status(400).json({ 
    message: 'Validation failed.', 
    error: 'Name is required.' 
  });
} else if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
  return res.status(400).json({ 
    message: 'Validation failed.', 
    error: 'Name should contain only letters, numbers, and spaces.' 
  });
}

    if (!phone || phone.trim() === '') {
      return res.status(400).json({ message: 'Validation failed.', error: 'Phone number is required.' });
    } else if (!/^\d{4,12}$/.test(phone)) {
      return res.status(400).json({ message: 'Validation failed.', error: 'Phone must be a valid number between 4 and 12 digits.' });
    }

    if (!email || email.trim() === '') {
      return res.status(400).json({ message: 'Validation failed.', error: 'Email is required.' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Validation failed.', error: 'Invalid email format.' });
    }

    if (!service || service.trim() === '') {
      return res.status(400).json({ message: 'Validation failed.', error: 'Service is required.' });
    }

        if (!clinic_id || clinic_id.trim() === '') {
      return res.status(400).json({ message: 'Validation failed.', error: 'clinic ID is required.' });
    }

    // ✅ Create Enquiry
    const enquiry = await SendEnquiry.create({
      name,
      phone,
      email,
      service,
      message,
      clinic_id,
      user_id,
    });

    // ✅ Get Clinic Email
    const clinic = await User.findByPk(clinic_id);
    if (clinic && clinic.email) {

      // ✅ Email transporter
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        logger: true,
        debug: true,
      });

      // ✅ Send HTML Email to Clinic
      await transporter.sendMail({
        from: `"ServiceCue" <${process.env.MAIL_USER}>`,
        to: clinic.email,
        subject: '📬 New Enquiry Received',
        html: `
          <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px; background-color: #ffffff;">
            <div style="text-align: center;">
              <img src="https://servicecue.com.au/web/assets/img/logo.png" alt="ServiceCue Logo" style="max-height: 60px; margin-bottom: 20px;">
            </div>

            <h2 style="color: #2D89EF; text-align: center;">You've Got a New Enquiry 📩</h2>

            <p style="font-size: 16px; color: #333;">Dear ${clinic.full_name || "Clinic"},</p>

            <p style="font-size: 16px; color: #333;">
              A new enquiry has been submitted. Please find the details below:
            </p>

            <div style="background-color: #f4f8fb; border-left: 4px solid #2D89EF; padding: 15px; margin: 20px 0;">
              <p style="font-size: 16px; color: #333;"><strong>Name:</strong> ${name}</p>
              <p style="font-size: 16px; color: #333;"><strong>Phone:</strong> ${phone}</p>
              <p style="font-size: 16px; color: #333;"><strong>Email:</strong> ${email}</p>
              <p style="font-size: 16px; color: #333;"><strong>Message:</strong><br/> ${message || '—'}</p>
            </div>

            <p style="font-size: 16px; color: #333;">📌 Please login to your dashboard to follow up or update the status.</p>

            <p style="font-size: 16px; color: #333;">Thank you,<br/>— The ServiceCue Team</p>

            <hr style="margin: 40px 0; border: none; border-top: 1px solid #e0e0e0;" />

            <p style="font-size: 12px; color: #999; text-align: center;">
              This email was sent to ${clinic.email}. If you are not the intended recipient, please ignore this message.
            </p>
          </div>
        `,
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Enquiry submitted successfully!',
      data: enquiry,
    });

  } catch (error) {
    console.error('Send Enquiry Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Something went wrong!',
      error: error.message,
    });
  }
};
exports.clinicProfessionals = async (req, res) => {
  try {
    const { clinic_id } = req.body;
    if (!clinic_id) {
      return res.status(400).json({ message: "clinic_id is required" });
    }

    const specialists = await User.findAll({
      where: {
        user_role_id: 2,
        created_by: clinic_id  // assuming 'created_by' links specialist to clinic
      },
      attributes: ["id", "full_name", "avatar", "experience", "specialists"]
    });

    if (!specialists || specialists.length === 0) {
      return res.status(200).json({
        message: "No professionals found for this clinic",
        data: []
      });
    }

    return res.status(200).json({
      message: "Professionals fetched successfully!",
      data: specialists
    });
  } catch (error) {
    console.error("Clinic Professionals Error:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};

exports.faqs = async (req, res) => {
  try {
    // ✅ Fetch only active FAQs
    const faqs = await Faq.findAll({
      where: { status: "active" },
      attributes: ["id", "question", "answer"], // only required fields
      order: [["id", "ASC"]] // optional: order by id
    });

    return res.status(200).json({
      status: true,
      message: "FAQs fetched successfully!",
      data: faqs
    });

  } catch (error) {
    console.error("❌ FAQs Fetch Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined
    });
  }
};
exports.Pages = async (req, res) => {
    try {
        const users = await Page.findAll();
        return res.status(200).json({
            message: 'List fetched successfully!',
            data: users,
        });
    } catch (error) {
        console.error('Error fetching splash screens:', error);
        return res.status(500).json({
            message: 'Something went wrong!',
            error: error.message,
        });
    }
};
exports.getPage = async (req, res) => {
  try {
    const { slug } = req.params;

    const page = await Page.findOne({
      where: { slug, status: "active" },
      attributes: ["id", "slug", "title", "content"]
    });

    if (!page) {
      return res.status(404).json({
        status: false,
        message: "Page not found."
      });
    }

    return res.status(200).json({
      status: true,
      message: "Page fetched successfully.",
      data: page
    });

  } catch (error) {
    console.error("❌ Page Fetch Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined
    });
  }
};
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;  // URL se user ID aayegi

        // Pehle check karo user exist karta hai ya nahi
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        // User ko delete karo
        await user.destroy();

        return res.status(200).json({
            message: 'User deleted successfully!',
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
            message: 'Something went wrong!',
            error: error.message,
        });
    }
};
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Pehle user find karo
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Status toggle karo
        user.status = !user.status;
        await user.save();

        return res.status(200).json({
            message: `User ${user.status ? 'activated' : 'deactivated'} successfully!`,
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
exports.updatePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, status } = req.body;
    const page = await Page.findOne({ where: { slug } });
    if (!page) {
      return res.status(404).json({
        status: false,
        message: "Page not found."
      });
    }

    // Update fields
    page.title = title || page.title;
    page.content = content || page.content;
    page.status = status || page.status;

    await page.save();

    return res.status(200).json({
      status: true,
      message: "Page updated successfully.",
      data: page
    });

  } catch (error) {
    console.error("❌ Page Update Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Step 1: Validate input
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        status: false,
        message: "Email, password and confirmPassword are required."
      });
    }

    // Step 2: Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: false,
        message: "Invalid email format."
      });
    }

    // Step 3: Confirm password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: false,
        message: "Password and Confirm Password do not match."
      });
    }

    // Step 4: Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found."
      });
    }

    // Step 5: Prevent reuse of old password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        status: false,
        message: "You cannot reuse your old password."
      });
    }

    // Step 6: Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 7: Update user password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Password reset successfully."
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "Something went wrong."
    });
  }
};

exports.CategoryServices = async (req, res) => {
  try {
    let { category_id = "", clinic_id } = req.body;
    let services;

    if (clinic_id) {
      // Fetch subcategory_ids from clinic_services
      const clinicServices = await ClinicServices.findAll({
        where: { clinic_id },
        attributes: ["subcategory_id"],
        raw: true,
      });
      const subcategoryIds = clinicServices.map((cs) => cs.subcategory_id);
      if (subcategoryIds.length > 0) {
        services = await ServiceModel.findAll({
          where: {
            id: {
              [Op.in]: subcategoryIds,
            },
          },
          order: [["id", "DESC"]],
        });
      } else {
        services = [];
      }
    } else {
      // Original category_id logic
      let categoryIds = [];

      if (category_id) {
        if (Array.isArray(category_id)) {
          categoryIds = category_id.map((id) => parseInt(id, 10));
        } else if (typeof category_id === "number") {
          categoryIds = [category_id];
        } else if (typeof category_id === "string") {
          categoryIds = category_id
            .split(",")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id));
        }
      }

      if (categoryIds.length > 0) {
        services = await ServiceModel.findAll({
          where: {
            category_id: {
              [Op.in]: categoryIds,
            },
          },
          order: [["id", "DESC"]],
        });
      } else {
        services = await ServiceModel.findAll({
          order: [["id", "DESC"]],
        });
      }
    }

    return res.status(200).json({
      message: "List fetched successfully!",
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};


exports.myEnquiry = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({
        message: "Unauthorized. Please login first."
      });
    }

    // ✅ Fetch all enquiries for logged-in user
    let enquiries = await SendEnquiry.findAll({
      where: { user_id },
      order: [["created_at", "DESC"]],
      raw: true
    });

    if (!enquiries || enquiries.length === 0) {
      return res.status(200).json({
        status: true,
        message: 'No enquiries found for this user.',
        data: []
      });
    }

    // ✅ Fetch clinic details
    const clinicIds = [...new Set(enquiries.map(e => e.clinic_id))];
    const clinics = await User.findAll({
      where: { id: clinicIds },
      attributes: ["id", "clinic_name", "address", "clinicLogo"],
      raw: true
    });

    const clinicMap = {};
    clinics.forEach(clinic => {
      clinicMap[clinic.id] = {
        clinicname: clinic.clinic_name || "Sample Clinic",
        address: clinic.address || "Sample Clinic Address",
        image: clinic.clinicLogo ? `${APP_URL}${clinic.clinicLogo}` : ""
      };
    });

    // ✅ Fetch service details
    const serviceIds = [...new Set(enquiries.map(e => e.service))]; // assuming `service` field is the ID
    const services = await ServiceModel.findAll({
      where: { id: serviceIds },
      attributes: ["id", "name"], // adjust field names
      raw: true
    });

    const serviceMap = {};
    services.forEach(service => {
      serviceMap[service.id] = {
        servicename: service.name || "Sample Service",
      };
    });

    // ✅ Combine data
    enquiries = enquiries.map(enquiry => ({
      ...enquiry,
      ...clinicMap[enquiry.clinic_id],
      ...serviceMap[enquiry.service],
      distance: "5 km" // static or calculate dynamically
    }));

    return res.status(200).json({
      status: true,
      message: "Enquiries fetched successfully!",
      data: enquiries
    });
  } catch (error) {
    console.error("My Enquiry Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};



exports.CategoryTreatment = async (req, res) => {
  try {
    const { category_id = '' } = req.body;

    // ✅ Convert "1,2" -> [1,2]
    let whereClause = {};
    if (category_id) {
      const ids = category_id.split(",").map((id) => parseInt(id.trim(), 10));
      whereClause = { category_id: { [Op.in]: ids } };
    }

    const services = await ServiceModel.findAll({
      where: whereClause,
      include: [
        {
          model: CategoryModel,
          as: "category",
          attributes: [["title", "name"]], // ✅ use title as name
        },
      ],
    });

    // ✅ Group by category name properly
    const result = {};
    services.forEach((service) => {
      const categoryName = service.category?.get("name") || "Unknown";
      if (!result[categoryName]) result[categoryName] = [];

      const { category, ...serviceData } = service.toJSON();
      result[categoryName].push(serviceData);
    });

    return res.status(200).json({
      message: "List fetched successfully!",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};



exports.editProductPrescriptionsoptions = async (req, res) => {
    try {
    const durations = [
      { label: "2 Weeks", value: "2 Weeks" },
      { label: "4 Weeks", value: "4 Weeks" },
      { label: "6 Weeks", value: "6 Weeks" },
      { label: "8 Weeks", value: "8 Weeks" },
      { label: "Ongoing Until Review", value: "Ongoing Until Review" },
    ];

        const intakeModeOptions = [
  { label: "Oral", value: "oral" },
  { label: "Topical", value: "topical" },
];
                const steps = [
  { label: "step1", value: "step1" },
  { label: "step2", value: "step2" },
    { label: "step3", value: "step3" },
  { label: "step4", value: "step4" },
    { label: "step5", value: "step5" },
  { label: "step6", value: "step6" },
    { label: "step7", value: "step7" },
  { label: "step8", value: "step8" },
];






                                        const TreatmentPhase = await ProductMeta.findAll({
      where: { type: 3 },
      attributes: ["id", "title", "size"],
      order: [["createdAt", "DESC"]],
    });


        const whenToStart = await ProductMeta.findAll({
      where: { type: 4 },
      attributes: ["id", "title", "size"],
      order: [["createdAt", "DESC"]],
    });
        const whenToStop = await ProductMeta.findAll({
      where: { type: 5 },
      attributes: ["id", "title", "size"],
      order: [["createdAt", "DESC"]],
    });
        const WhenToResume = await ProductMeta.findAll({
      where: { type: 6 },
      attributes: ["id", "title", "size"],
      order: [["createdAt", "DESC"]],
    });




                                const productMetaRecords = await ProductMeta.findAll({
      where: { type: 2 },
      attributes: ["id", "title", "size"], // 👈 ensure "size" field exists in your table
      order: [["createdAt", "DESC"]],
    });

    // ✅ 6. Convert `size` → `status` and map data
    const frequency = productMetaRecords.map((item) => ({
      id: item.id,
      label: item.title,
      status: item.size, // 👈 size renamed to status
    }));



        return res.status(200).json({
            message: 'List fetched successfully!',
            intakeModeOptions: intakeModeOptions,
              whenToStart: whenToStart,
            whenToStop: whenToStop,
            durations: durations,
            frequencyOptions: frequency,
            TreatmentPhase: TreatmentPhase,
            WhenToResume: WhenToResume,
            steps: steps,
        });
    } catch (error) {
        console.error('Error fetching splash screens:', error);
        return res.status(500).json({
            message: 'Something went wrong!',
            error: error.message,
        });
    }
};



exports.ProductType = async (req, res) => {
  try {
    const intakeModeOptions = [
      { label: "Oral", value: "oral" },
      { label: "Topical", value: "topical" },
    ];

    const durations = [
      { label: "2 Weeks", value: "2 Weeks" },
      { label: "4 Weeks", value: "4 Weeks" },
      { label: "6 Weeks", value: "6 Weeks" },
      { label: "8 Weeks", value: "8 Weeks" },
      { label: "Ongoing Until Review", value: "Ongoing Until Review" },
    ];

    // ✅ Fetch productMetaRecords first
    const productMetaRecords = await ProductMeta.findAll({
      where: { type: 1 },
      attributes: ["id", "title", "size"],
      order: [["createdAt", "DESC"]],
    });

    // ✅ Then map it for frequency
const frequencyRecords = await ProductMeta.findAll({ 

      where: { type: 2 },
      attributes: ["id", "title", "size"],
      order: [["createdAt", "DESC"]],
    });

    // ✅ Map frequency
    const frequency = frequencyRecords.map((item) => ({
      id: item.id,
      label: item.title,
      status: item.size,
    }));




        const TreatmentPhase = await ProductMeta.findAll({
      where: { type: 3 },
      attributes: ["id", "title", "size"],
      order: [["createdAt", "DESC"]],
    });


        const WhenToStart = await ProductMeta.findAll({
      where: { type: 4 },
      attributes: ["id", "title", "size"],
      order: [["createdAt", "DESC"]],
    });
        const WhenToStop = await ProductMeta.findAll({
      where: { type: 5 },
      attributes: ["id", "title", "size"],
      order: [["createdAt", "DESC"]],
    });
        const WhenToResume = await ProductMeta.findAll({
      where: { type: 6 },
      attributes: ["id", "title", "size"],
      order: [["createdAt", "DESC"]],
    });



    return res.status(200).json({
      message: "List fetched successfully!",
      intakeModeOptions,
      durations,
      ProductType: productMetaRecords,
      frequency,
      TreatmentPhase,
      WhenToStart,
      WhenToStop,
      WhenToResume,
    });
  } catch (error) {
    console.error("Error fetching product types:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};



exports.ProductDose = async (req, res) => {
  try {
    const { product_type_id } = req.body;

    if (!product_type_id) {
      return res.status(400).json({
        message: 'product_type_id is required!',
      });
    }

    // 🔍 Step 1: If product_type_id is string (name), find its actual ID
    const typeRecord = await ProductMeta.findOne({
      where: { title: product_type_id },
      attributes: ['id'],
    });

    if (!typeRecord) {
      return res.status(404).json({
        message: 'Invalid product_type_id. No matching Product Type found!',
      });
    }

    const typeId = typeRecord.id;

    // 📦 Step 2: Fetch product dose options using the found ID
    const productMetaRecords = await Productmetaoption.findAll({
      where: { meta_id: typeId },
      attributes: ["id", "title"],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      message: 'List fetched successfully!',
      data: productMetaRecords,
    });
  } catch (error) {
    console.error('Error fetching product dose options:', error);
    return res.status(500).json({
      message: 'Something went wrong!',
      error: error.message,
    });
  }
};



exports.dashboardData = async (req, res) => {
  try {
    const { clinic_id } = req.body;

    if (!clinic_id) {
      return res.status(400).json({
        status: false,
        message: "clinic_id is required.",
      });
    }

    // Step 1️⃣: Basic Counts
    const [totalStaff, totalClients, totalProducts, totalTreatments] = await Promise.all([
      User.count({ where: { user_role_id: 2, created_by: clinic_id } }),
      Client.count({ where: { created_by: clinic_id } }),
      Product.count({ where: { clinic_id } }),
      TreatmentPlan.count({ where: { clinic_id } }),
    ]);

    // Step 2️⃣: Top Services (Top 3)
    const topTreatments = await TreatmentPlan.findAll({
      where: { clinic_id },
      attributes: [
        "treatment_id",
        "cat_id",
        [Sequelize.fn("COUNT", Sequelize.col("treatment_id")), "count"],
      ],
      group: ["treatment_id"],
      order: [[Sequelize.literal("count"), "DESC"]],
      limit: 3,
      raw: true,
    });

    const serviceIds = topTreatments.map((t) => t.cat_id);
    const services = await ServiceModel.findAll({
      where: { id: serviceIds },
      attributes: ["id", "name"],
      raw: true,
    });

    const topServices = topTreatments.map((t) => {
      const service = services.find((s) => s.id === t.cat_id);
      const count = Number(t.count);
      const percentage =
        totalTreatments > 0
          ? parseFloat(((count / totalTreatments) * 100).toFixed(1))
          : 0;
      return {
        service_name: service ? service.name : "Unknown",
        count,
        percentage,
      };
    });

    // Step 3️⃣: Enquiries Count
    const [totalEnquiries, pendingEnquiries, activeEnquiries, completedEnquiries] = await Promise.all([
      SendEnquiry.count({ where: { clinic_id } }),
      SendEnquiry.count({ where: { clinic_id, status: 0 } }),
      SendEnquiry.count({ where: { clinic_id, status: 1 } }),
      SendEnquiry.count({ where: { clinic_id, status: 2 } }),
    ]);

    // Step 4️⃣: Monthly Enquiry Trend
    const last12Months = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return {
        month: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
      };
    });

    const enquiryStatsRaw = await SendEnquiry.findAll({
      where: {
        clinic_id,
        createdAt: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 11)),
        },
      },
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("created_at")), "month"],
        [Sequelize.fn("YEAR", Sequelize.col("created_at")), "year"],
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["year", "month", "status"],
      order: [["year", "ASC"], ["month", "ASC"]],
      raw: true,
    });

    const enquiryStats = last12Months.map((m) => {
      const monthData = enquiryStatsRaw.filter(
        (e) =>
          parseInt(e.year) === m.year &&
          parseInt(e.month) ===
            new Date(`${m.month} 1, ${m.year}`).getMonth() + 1
      );

      return {
        month: m.month,
        active: monthData.find((x) => x.status === 1)?.count || 0,
        pending: monthData.find((x) => x.status === 0)?.count || 0,
      };
    });


    // Step 5️⃣ & 6️⃣: Treatment Retention
const allTreatments = await TreatmentPlan.findAll({
  where: { clinic_id },
  attributes: ["treatment_id", "status", "created_at"],
  raw: true,
  order: [["created_at", "ASC"]],
});

// Group treatments by treatment_id
const groupedByTreatment = {};
for (const t of allTreatments) {
  if (!groupedByTreatment[t.treatment_id]) groupedByTreatment[t.treatment_id] = [];
  groupedByTreatment[t.treatment_id].push(t);
}

// Exclude first entry (initial treatment) and only count repeat entries
let totalRetentionTreatments = 0;
let retainedTreatments = 0;

for (const treatments of Object.values(groupedByTreatment)) {
  if (treatments.length > 1) {
    // Exclude the first entry — only consider repeats
    const repeatEntries = treatments.slice(1);
    totalRetentionTreatments += repeatEntries.length;
    retainedTreatments += repeatEntries.filter(t => t.status === 1).length;
  }
}

const overallRetentionRate =
  totalRetentionTreatments > 0
    ? parseFloat(((retainedTreatments / totalRetentionTreatments) * 100).toFixed(1))
    : 0;

// Use the same `last12Months` you already defined earlier in the code
const monthlyRetentionTrend = last12Months.map((m) => {
  // Filter treatments that belong to this month
  const monthData = allTreatments.filter((t) => {
    const createdDate = new Date(t.created_at);
    return (
      createdDate.getMonth() === new Date(`${m.month} 1, ${m.year}`).getMonth() &&
      createdDate.getFullYear() === m.year
    );
  });

  // Same exclusion logic: skip first, only consider repeats
  const groupedMonth = {};
  for (const t of monthData) {
    if (!groupedMonth[t.treatment_id]) groupedMonth[t.treatment_id] = [];
    groupedMonth[t.treatment_id].push(t);
  }

  let total = 0;
  let completed = 0;
  for (const treatments of Object.values(groupedMonth)) {
    if (treatments.length > 1) {
      const repeatEntries = treatments.slice(1);
      total += repeatEntries.length;
      completed += repeatEntries.filter(t => t.status === 1).length;
    }
  }

  const retentionRate = total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0;

  return {
    month: m.month,
    retentionRate,
  };
});


const treatments = await TreatmentPlan.findAll({
  where: { clinic_id },
  attributes: ["id"],
  raw: true,
});
const treatmentIds = treatments.map(t => t.id);

// 🧠 Step 2: Count total prescribed products (treatmentproducts)
const totalProductss = await TreatmentProduct.count({
  where: { treatment_id: { [Op.in]: treatmentIds } },
});

// 🧠 Step 3: Count total repurchases (treatment_products_repurchase)
const totalRepurchases = await TreatmentProductsRepurchase.count({
  where: {
    treatment_id: { [Op.in]: treatmentIds },
    status: 1
  },
});

// 🧮 Step 4: Calculate Repurchase Rate
const overallRepurchaseRate =
  totalProductss > 0
    ? parseFloat(((totalRepurchases / totalProductss) * 100).toFixed(1))
    : 0;

// 🧠 Step 5: Monthly Repurchase Trend (last 12 months)
const monthlyRaw = await TreatmentProductsRepurchase.findAll({
  where: {
    treatment_id: { [Op.in]: treatmentIds },
    status: 1,
    created_at: {
      [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 11)),
    },
  },
  attributes: [
    [Sequelize.fn("MONTH", Sequelize.col("created_at")), "month"],
    [Sequelize.fn("YEAR", Sequelize.col("created_at")), "year"],
  ],
  raw: true,
});



// 📈 Step 6: Calculate trend
const monthlyRepurchaseTrend = last12Months.map((m) => {
  const monthData = monthlyRaw.filter(
    (r) =>
      parseInt(r.year) === m.year &&
      parseInt(r.month) === new Date(`${m.month} 1, ${m.year}`).getMonth() + 1
  );

  return {
    month: m.month,
    repurchaseCount: monthData.length,
  };
});



const treatmentsAll = await TreatmentPlan.findAll({
  where: { clinic_id },
  attributes: [
    [Sequelize.fn("MONTH", Sequelize.col("created_at")), "month"],
    [Sequelize.fn("YEAR", Sequelize.col("created_at")), "year"],
    "status",
    [Sequelize.fn("SUM", Sequelize.col("price")), "total_value"],
  ],
  group: ["year", "month", "status"],
  raw: true,
});

const last12MonthsMissed = [...Array(12)].map((_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - (11 - i));
  return {
    month: d.toLocaleString("default", { month: "short" }),
    year: d.getFullYear(),
  };
});

const missedOpportunityChart = last12MonthsMissed.map((m) => {
  const monthData = treatmentsAll.filter(
    (t) =>
      parseInt(t.year) === m.year &&
      parseInt(t.month) === new Date(`${m.month} 1, ${m.year}`).getMonth() + 1
  );

  // Total expected (all treatment plans)
  const total = monthData.reduce(
    (sum, t) => sum + parseFloat(t.total_value || 0),
    0
  );

  // Actual profit (status = 1)
  const profit = monthData
    .filter((x) => x.status === 1)
    .reduce((sum, x) => sum + parseFloat(x.total_value || 0), 0);

  return {
    month: m.month,
    profit: parseFloat(profit.toFixed(2)), // Achieved amount
    loss: parseFloat(total.toFixed(2)),    // Total expected amount
    missedOpportunity: parseFloat((total - profit).toFixed(2)), // Difference
  };
});


// 🔹 Fetch all treatments (with staff info)
const allTreatmentss = await Treatment.findAll({
  where: { clinic_id },
  attributes: ["id", "client_id", "created_by"],
  raw: true,
});

// 🔹 Fetch all treatment plans (for completion check)
const allTreatmentPlanss = await TreatmentPlan.findAll({
  where: { clinic_id },
  attributes: ["id", "treatment_id", "status"],
  raw: true,
});

// 🔹 Map treatmentPlans by treatment_id
const planStatusMap = {};
for (const plan of allTreatmentPlanss) {
  if (!planStatusMap[plan.treatment_id]) planStatusMap[plan.treatment_id] = [];
  planStatusMap[plan.treatment_id].push(plan.status);
}

// 🔹 Group treatments by staff
const staffMap = {};
for (const t of allTreatmentss) {
  if (!staffMap[t.created_by]) staffMap[t.created_by] = [];
  staffMap[t.created_by].push(t);
}

// 🔹 Calculate Completion Rate per staff (from treatmentPlans)
const completionData = Object.entries(staffMap).map(([staffId, treatments]) => {
  let total = 0;
  let completed = 0;

  treatments.forEach((t) => {
    if (planStatusMap[t.id]) {
      total += planStatusMap[t.id].length;
      completed += planStatusMap[t.id].filter((s) => s === 1).length;
    }
  });

  return {
    staff_id: staffId,
    total,
    completed,
    completionRate:
      total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0,
    clientIds: [...new Set(treatments.map((t) => t.client_id))],
  };
});

// 🔹 Find rebooked clients (clients who came more than once)
const clientVisitMap = {};
for (const t of allTreatmentss) {
  if (!clientVisitMap[t.client_id]) clientVisitMap[t.client_id] = 0;
  clientVisitMap[t.client_id]++;
}
const rebookedClients = Object.keys(clientVisitMap).filter(
  (id) => clientVisitMap[id] > 1
);

// 🔹 Calculate Rebooking Rate per staff (from treatment)
const leaderboardData = completionData.map((data) => {
  const staffClients = data.clientIds;
  const rebookedCount = staffClients.filter((id) =>
    rebookedClients.includes(String(id))
  ).length;

  const rebookRate =
    staffClients.length > 0
      ? parseFloat(((rebookedCount / staffClients.length) * 100).toFixed(1))
      : 0;

  return {
    staff_id: data.staff_id,
    completionRate: data.completionRate,
    rebookRate,
  };
});

// 🔹 Fetch staff names
const staffIds = leaderboardData.map((l) => l.staff_id);
const staffDetails = await User.findAll({
  where: { id: staffIds },
  attributes: ["id", "full_name"],
  raw: true,
});

// 🔹 Merge names
leaderboardData.forEach((item) => {
  const staff = staffDetails.find((s) => s.id == item.staff_id);
  item.staff_name = staff ? staff.full_name : "Unknown Staff";
});


const topStaff = await AssignClient.findAll({
  where: { clinic_id },
  attributes: [
    "staff_id",
    [Sequelize.fn("COUNT", Sequelize.col("client_id")), "total_clients"],
  ],
  include: [
    {
      model: User,
      as: "staff",
      attributes: ["full_name","designation","avatar"],
    },
  ],
  group: ["staff_id"],
  order: [[Sequelize.literal("total_clients"), "DESC"]],
  limit: 3,
  raw: true,
  nest: true,
});

// 🔹 Remove any duplicates (just in case)
const uniqueTopStaff = [
  ...new Map(topStaff.map((item) => [item.staff_id, item])).values(),
];


    // ✅ Step 7️⃣: Final Response (matches your required format)
    return res.status(200).json({
      status: true,
      message: "Dashboard data fetched successfully!",
        data: {
        totalStaff,
        totalClients,
        totalProducts,
        totalTreatments,
        totalEnquiries,
        pendingEnquiries,
        activeEnquiries,
        topServices,
        enquiryStats,
        clientRetention: {
        overallRetentionRate,
        monthlyRetentionTrend,
        },
        RepurchaseRate: {
        overallRepurchaseRate,
        totalProductss,
        totalRepurchases,
        monthlyRepurchaseTrend,
        },
        missedOpportunityChart,
        leaderboardData,
        uniqueTopStaff,
        },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};




exports.lastactivetreatment = async (req, res) => {
  try {
    const { client_id } = req.body;

    if (!client_id) {
      return res.status(400).json({
        status: false,
        message: "client_id is required.",
      });
    }

    // 🔹 Fetch the last (most recent) treatment for this client
    const lastTreatment = await Treatment.findOne({
      where: { client_id },
      order: [["id", "DESC"]],
      attributes: ["id","created_at"], // include what you need
    });

    if (!lastTreatment) {
      return res.status(404).json({
        status: false,
        message: "No treatment found for this client.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Last treatment fetched successfully!",
      data: {
        treatment_id: lastTreatment.id,
        created_at: lastTreatment.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching last treatment:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};

exports.support = async (req, res) => {
  try {
const data = [
  { email: "admin@servicecue.com.au",aboutApp: "https://servicecue.com.au/book-a-demo",termsConditions: "https://servicecue.com.au/book-a-demo",privacyPolicies: "https://servicecue.com.au/book-a-demo",fAndQs: "https://servicecue.com.au/book-a-demo"},
];
    return res.status(200).json({
      message: 'List fetched successfully!',
      data: data,
    });
  } catch (error) {
    console.error('Error fetching product dose options:', error);
    return res.status(500).json({
      message: 'Something went wrong!',
      error: error.message,
    });
  }
};


exports.notifications = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({
        message: "Unauthorized. Please login first."
      });
    }
    // ✅ Fetch all enquiries for logged-in user
    let list = await Notifications.findAll({
      where: { user_id },
      order: [["created_at", "DESC"]],
      raw: true
    });
    return res.status(200).json({
      status: true,
      message: "Enquiries fetched successfully!",
      data: list
    });
  } catch (error) {
    console.error("Notifications Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};


exports.admindashboardData = async (req, res) => {
  try {
    const { clinic_id } = req.body;

    if (!clinic_id) {
      return res.status(400).json({
        status: false,
        message: "clinic_id is required.",
      });
    }

    // ---- Basic Dashboard Data ----
    const [totalStaff, totalClients, totalProducts] = await Promise.all([
      User.count({ where: { user_role_id: 2 } }),
      Client.count(),
      Product.count(),
    ]);

    // ---- Top Clinics ----
    const topClinics = await SendEnquiry.findAll({
      attributes: [
        "clinic_id",
        [Sequelize.fn("COUNT", Sequelize.col("clinic_id")), "enquiry_count"],
        [
          Sequelize.literal(`(
            SELECT clinic_name 
            FROM Users 
            WHERE Users.id = SendEnquiry.clinic_id
          )`),
          "clinic_name",
        ],
      ],
      group: ["clinic_id"],
      order: [[Sequelize.literal("enquiry_count"), "DESC"]],
      limit: 3,
      raw: true,
    });

    // ---- Prepare last 12 months ----
    const last12Months = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return {
        month: d.getMonth() + 1,
        monthName: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
      };
    });

    // ---- Role Map for Users ----
    const roleMap = { 1: "Admin", 2: "Staff", 3: "Client" };

    // ---- Users Stats (existing logic) ----
    const usersRaw = await User.findAll({
      where: {
        user_role_id: { [Op.in]: [1, 2, 3] },
        created_at: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 11)),
        },
      },
      attributes: [
        "id",
        "full_name",
        "user_role_id",
        [Sequelize.fn("MONTH", Sequelize.col("created_at")), "month"],
        [Sequelize.fn("YEAR", Sequelize.col("created_at")), "year"],
      ],
      order: [["created_at", "ASC"]],
      raw: true,
    });

    const usersStats = last12Months.map((m) => {
      const monthData = usersRaw.filter(
        (x) => parseInt(x.year) === m.year && parseInt(x.month) === m.month
      );

      const roles = Object.entries(roleMap).map(([roleId, roleName]) => {
        const roleUsers = monthData
          .filter((x) => x.user_role_id === Number(roleId))
          .map((u) => u.full_name);
        return {
          roleId: Number(roleId),
          roleName,
          count: roleUsers.length,
          users: roleUsers.join(", "),
        };
      });

      return { month: m.monthName, roles };
    });

    // ---- Subscription Plan Sales ----
    const subscriptions = await Subscription.findAll({
      attributes: [
        "stripe_price",
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 11)),
        },
        stripe_status: "active",
      },
      raw: true,
    });

    const plans = await SubscriptionPlans.findAll({
      attributes: ["stripe_price_id", "title","amount"],
      raw: true,
    });

    // Create map for easy lookup
    const priceToPlanMap = {};
    plans.forEach((p) => {
      priceToPlanMap[p.stripe_price_id] = p.title;
    });

    // Count monthly sales by plan
const subscriptionStats = last12Months.map((m) => {
  const monthData = subscriptions.filter(
    (s) => parseInt(s.year) === m.year && parseInt(s.month) === m.month
  );

  const planCounts = plans.map((plan) => {
    const count = monthData.filter(
      (s) => s.stripe_price === plan.stripe_price_id
    ).length;

    return { planName: plan.title, planPrice: plan.amount, count };
  });

  return { month: m.monthName, plans: planCounts };
});

const latestClinics = await User.findAll({
  where: { user_role_id: 4 },
  attributes: ["id", "full_name","clinic_name","mobile", "email", "avatar", "clinicLogo", "created_at"],
  order: [["created_at", "DESC"]],
  limit: 5,
});

// ---- Latest 5 Users (role_id = 1) ----
const latestUsers = await User.findAll({
  where: { user_role_id: 1 },
  attributes: ["id", "full_name","clinic_name","mobile", "email", "avatar", "clinicLogo", "created_at"],
  order: [["created_at", "DESC"]],
  limit: 5,
});


    // ---- Final Response ----
    return res.status(200).json({
      status: true,
      message: "Dashboard data fetched successfully!",
      data: {
        totalStaff,
        totalClients,
        totalProducts,
        topClinics,
        usersStats,
        subscriptionStats,
        latestClinics,
        latestUsers, // 👈 Add this for your 3 plan graphs
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};
