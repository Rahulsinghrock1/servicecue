require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ClinicReview = require('@models/Reviews');
const nodemailer = require('nodemailer');
const uploadProfilePic = require("@helpers/imageUpload");
const { getUserDetails } = require('@helpers/commonHelper');
const User = require('@models/User');
const ClinicOperational = require('@models/ClinicOperational');
const Service = require('@models/Service');
const ClinicServices = require("@models/ClinicServices");
const Category = require('@models/Category');
const { Op } = require("sequelize");
const ClinicFollow = require('@models/ClinicFollow');

function formatDateLong(dateInput) {
  if (!dateInput) return "Invalid Date";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Invalid Date";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Helper: check if open now ---
function isClinicOpenNow(ops) {
  const now = new Date();
  const currentDay = now.toLocaleString("en-US", { weekday: "long" });
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const today = ops.find(
    (op) => op.label === currentDay && op.type === "workingDay" && op.active === 1
  );
  if (!today) return false;
  return currentTime >= today.from && currentTime <= today.to;
}

// --- Helper: timing filter ---
function matchTimingFilter(ops, filterType) {
  if (!filterType) return true;

  const now = new Date();
  const currentDay = now.toLocaleString("en-US", { weekday: "long" });
  const todayOps = ops.filter(
    (op) => op.label === currentDay && op.type === "workingDay" && op.active === 1
  );
  if (todayOps.length === 0) return false;

  const parseTime = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const MORNING_START = 6 * 60; // 6:00
  const MORNING_END = 12 * 60; // 12:00
  const EVENING_START = 17 * 60; // 17:00
  const EVENING_END = 21 * 60; // 21:00
  const NIGHT_START = 21 * 60; // 21:00
  const NIGHT_END = 6 * 60; // 06:00 (next day)

  for (const op of todayOps) {
    const fromMins = parseTime(op.from);
    const toMins = parseTime(op.to);

    // Handle timing logic
    switch (filterType) {
      case "Open Now": {
        const currentMins = now.getHours() * 60 + now.getMinutes();
        if (currentMins >= fromMins && currentMins <= toMins) return true;
        break;
      }

      case "Morning": {
        if (fromMins < MORNING_END && toMins > MORNING_START) return true;
        break;
      }

      case "Evening": {
        if (fromMins < EVENING_END && toMins > EVENING_START) return true;
        break;
      }

      case "Night": {
        // night = shift overlaps 21:00–06:00 window
        if (fromMins >= NIGHT_START || toMins <= NIGHT_END) return true;
        break;
      }

      default:
        return true;
    }
  }

  return false;
}


// exports.Clinic = async (req, res) => {
//   try {
//     // Step 1: Decode token and get user_id
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "Authentication token is required." });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
//     const user_id = decoded.id;
//     const { cat_id, status,lat,long } = req.body || {};
//     const whereCondition = { user_role_id: 4 };
//     // Build include condition
//     const includeCondition = [
//       {
//         model: ClinicReview,
//         as: "reviews",
//         required: false,
//         attributes: ["rating"],
//       },
//     ];

//     if (cat_id) {
//       includeCondition.push({
//         model: ClinicServices,
//         as: "clinic_services",
//         required: true,
//         where: { category_id: cat_id },
//         attributes: [],
//       });
//     }

//     // Step 2: Get all followed clinic IDs
//     const follows = await ClinicFollow.findAll({
//       where: { user_id },
//       attributes: ["clinic_id"],
//     });

//     const followedClinicIds = follows.map((f) => f.clinic_id);

//     // Step 3: Fetch all clinics (filtered by status if needed)
//     let clinics = await User.findAll({
//       where: whereCondition,
//       order: [["created_at", "DESC"]],
//       attributes: ["id", "clinic_name", "clinicLogo", "address"],
//       include: includeCondition,
//       distinct: true,
//     });

//     // If status === true, filter to only followed clinics
//     if (status === true) {
//       clinics = clinics.filter((clinic) =>
//         followedClinicIds.includes(clinic.id)
//       );
//     }

//     // Step 4: Build final response
//     const data = clinics.map((clinic) => {
//       const reviews = clinic.reviews || [];
//       const totalRating = reviews.reduce(
//         (sum, r) => sum + (Number(r.rating) || 0),
//         0
//       );
//       const avgRating = reviews.length
//         ? Number((totalRating / reviews.length).toFixed(1))
//         : null;

//       return {
//         id: clinic.id || "",
//         clinic_name: clinic.clinic_name || "",
//         address: clinic.address || "",
//         clinicLogo: clinic.clinicLogo || "",
//         rating: avgRating,
//         totalReviews: reviews.length,
//         distance: "3.2 km",
//         clinic_status: "Open",
//         favorite_status: followedClinicIds.includes(clinic.id), // ✅ Always correct
//       };
//     });

//     return res.status(200).json({
//       status: true,
//       message: "Clinic list fetched successfully!",
//       data,
//     });
//   } catch (error) {
//     console.error("Error fetching clinics:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Something went wrong!",
//       error: error.message,
//     });
//   }
// };

exports.Clinic = async (req, res) => {
  try {
    // --- Token ---
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ message: "Authentication token is required." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const user_id = decoded.id;

    // --- Request body ---
    const {
      cat_id, // subcategory_id
      search,
      lat,
      long,
      status,
      distance, // filter distance in KM
      rating, // min rating
      timing, // Open Now / Morning / Evening / Night
    } = req.body || {};

    // --- Base filter ---
    const whereCondition = { user_role_id: 4 };
    if (search && search.trim() !== "")
      whereCondition.clinic_name = { [Op.like]: `%${search.trim()}%` };

    // --- Fetch all clinics ---
    const clinics = await User.findAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
      attributes: ["id", "clinic_name", "clinicLogo", "address", "lat", "lon"],
    });

    const clinicIds = clinics.map((c) => c.id);

    // --- Related data ---
    const [reviews, operationals, follows] = await Promise.all([
      ClinicReview.findAll({
        where: { clinic_id: clinicIds },
        attributes: ["clinic_id", "rating"],
      }),
      ClinicOperational.findAll({
        where: { clinic_id: clinicIds },
        attributes: ["clinic_id", "label", "type", "active", "from", "to"],
      }),
      ClinicFollow.findAll({
        where: { user_id },
        attributes: ["clinic_id"],
      }),
    ]);

    const followedClinicIds = follows.map((f) => f.clinic_id);

    // --- Filter by subcategory ---
    let filteredClinicIds = clinicIds;
    if (cat_id) {
      const services = await ClinicServices.findAll({
        where: { subcategory_id: cat_id },
        attributes: ["clinic_id"],
      });
      filteredClinicIds = services.map((s) => Number(s.clinic_id));
    }

    // --- Build response list ---
    let filteredClinics = clinics
      .filter((c) => filteredClinicIds.includes(Number(c.id)))
      .map((clinic) => {
        const clinicReviews = reviews.filter((r) => r.clinic_id === clinic.id);
        const totalRating = clinicReviews.reduce(
          (sum, r) => sum + (Number(r.rating) || 0),
          0
        );
        const avgRating = clinicReviews.length
          ? Number((totalRating / clinicReviews.length).toFixed(1))
          : 0;

        const operational = operationals.filter((o) => o.clinic_id === clinic.id);
        const openStatus = isClinicOpenNow(operational);

        let distanceVal = null;
        if (lat && long && clinic.lat && clinic.lon) {
          distanceVal = calculateDistance(
            parseFloat(lat),
            parseFloat(long),
            parseFloat(clinic.lat),
            parseFloat(clinic.lon)
          );
        }

        return {
          id: clinic.id,
          clinic_name: clinic.clinic_name,
          address: clinic.address,
          clinicLogo: clinic.clinicLogo,
          rating: avgRating,
          totalReviews: clinicReviews.length,
          distance: distanceVal ? parseFloat(distanceVal.toFixed(2)) : null,
          clinic_status: openStatus ? "Open" : "Closed",
          favorite_status: followedClinicIds.includes(clinic.id),
          operational,
        };
      })
      .filter((c) => {
        // Favorites filter
        if (status === true && !c.favorite_status) return false;

        // Distance filter
        if (distance && c.distance !== null && c.distance > distance) return false;

        // Rating filter
        if (rating && c.rating < rating) return false;

        // Timing filter
        if (timing && !matchTimingFilter(c.operational, timing)) return false;

        return true;
      })
      .sort((a, b) => {
        if (a.distance && b.distance)
          return parseFloat(a.distance) - parseFloat(b.distance);
        return 0;
      });

    return res.status(200).json({
      status: true,
      message: "Clinic list fetched successfully!",
      total: filteredClinics.length,
      data: filteredClinics,
    });
  } catch (error) {
    console.error("Error fetching clinics:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};



// ✅ DETAILS API
exports.ClinicDetails = async (req, res) => {
  try {
    // ✅ Step 1: Decode token and get user_id
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token is required." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const user_id = decoded.id;

    const { id } = req.params;

    // ✅ Step 2: Check if clinic is followed by user
    const isFollowed = await ClinicFollow.findOne({
      where: { user_id, clinic_id: id },
    });

    // ✅ Step 3: Fetch clinic details
    const clinic = await User.findOne({
      where: { id, user_role_id: 4 },
      include: [
        { model: ClinicOperational, as: "operational_hours" },
        { model: ClinicReview, as: "reviews" },
        {
          model: User,
          as: "specialists_list",
          where: { user_role_id: 2 },
          required: false,
          attributes: ["id", "full_name", "avatar", "experience", "specialists"],
        },
        {
          model: ClinicServices,
          as: "clinic_services",
          required: false,
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!clinic) {
      return res.status(404).json({
        status: false,
        message: "Clinic not found!",
      });
    }

    // ✅ Step 4: Handle base URL for images
    const baseUrl = process.env.BASE_PATH.endsWith('/')
      ? process.env.BASE_PATH
      : process.env.BASE_PATH + '/';

    // ✅ Step 5: Handle reviews & rating
    const reviews = clinic.reviews || [];
    const totalRating = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    const avgRating = reviews.length ? (totalRating / reviews.length).toFixed(1) : 0;

    // ✅ Step 6: Handle services
    const servicesSpecialty = (clinic.clinic_services || []).map(cs => ({
      id: cs.service?.id || null,
      name: cs.service?.name || "",
      category_id: cs.category_id,
      subcategory_id: cs.subcategory_id,
    }));

    // ✅ Step 7: Final response object
    const updatedClinic = {
      ...clinic.toJSON(),
      logo: clinic.logo
        ? (clinic.logo.startsWith("http") ? clinic.logo : baseUrl + clinic.logo)
        : null,
      image: clinic.image
        ? (clinic.image.startsWith("http") ? clinic.image : baseUrl + clinic.image)
        : null,
      rating: avgRating,
      totalReviews: reviews.length,
      distance: "2.3 km",
      favorite_status: !!isFollowed, // ✅ true/false as in Clinic API
      servicesSpecialty,
    };

    return res.status(200).json({
      status: true,
      message: "Details fetched successfully!",
      data: updatedClinic,
    });
  } catch (error) {
    console.error("Error fetching clinic details:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};



exports.addReview = async (req, res) => {
  try {
    const { rating, review, clinic_id } = req.body || {};

    if (!rating || !clinic_id) {
      return res.status(400).json({ message: "Rating and clinicId are required" });
    }

    const newReview = await ClinicReview.create({
      rating,
      review,
      clinic_id,
      user_id: req.user.id
    });

    return res.status(201).json({ message: "Review added successfully", status: true, review: newReview });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({ message: "Something went wrong!",  status: false, error: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { id: clinicId } = req.params;

    // 🔹 Fetch clinic info from User table
    const clinic = await User.findOne({
      where: { id: clinicId },
      attributes: ["id", "full_name", "avatar", "email"],
    });

    if (!clinic) {
      return res.status(404).json({
        status: false,
        message: "Clinic not found!",
      });
    }

    // 🔹 Fetch all reviews for this clinic
    const reviews = await ClinicReview.findAll({
      where: { clinic_id: clinicId },
      order: [["createdAt", "DESC"]],
    });

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No reviews found for this clinic!",
        clinic, // still return clinic info
      });
    }

    // 🔹 Fetch all unique users who wrote reviews
    const userIds = [...new Set(reviews.map((r) => r.user_id))];
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ["id", "full_name", "avatar", "email"],
    });
    const userMap = {};
    users.forEach((u) => (userMap[u.id] = u));

    // 🔹 Map reviews with user info & formatted date
    const formattedReviews = reviews.map((review) => {
      const user = userMap[review.user_id];
      return {
        id: review.id,
        rating: review.rating,
        review: review.review,
        created_at: formatDateLong(review.createdAt),
        user: {
          id: user?.id || null,
          name: user?.full_name || "Anonymous",
          avatar:
            user?.avatar ||
            "http://localhost:5000/api/uploads/users/default-avatar.jpg",
          email: user?.email || null,
        },
      };
    });

    // 🔹 Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = (totalRating / reviews.length).toFixed(1);

    // 🔹 Final response
    return res.status(200).json({
      status: true,
      message: "Clinic reviews fetched successfully!",
      clinic: {
        id: clinic.id,
        name: clinic.full_name,
        avatar:
          clinic.avatar ||
          "http://localhost:5000/api/uploads/users/default-avatar.jpg",
        email: clinic.email,
      },
      avgRating,
      totalReviews: reviews.length,
      data: formattedReviews,
    });
  } catch (error) {
    console.error("❌ Error fetching clinic reviews:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};
exports.FollowClinic = async (req, res) => {
  try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );
    const user_id = decoded.id;


    const {clinic_id } = req.body;

    if (!user_id || !clinic_id) {
      return res.status(400).json({
        status: false,
        message: "user_id and clinic_id are required",
      });
    }

    // Check if already followed
    const existingFollow = await ClinicFollow.findOne({
      where: { user_id, clinic_id },
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      return res.status(200).json({
        status: true,
        message: "Unfollowed successfully",
        action: "unfollow",
      });
    } else {
      // Follow
      await ClinicFollow.create({ user_id, clinic_id });
      return res.status(200).json({
        status: true,
        message: "Followed successfully",
        action: "follow",
      });
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};


