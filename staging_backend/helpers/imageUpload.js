const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure directories exist
const makeDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Define directories
const uploadBase = path.join(__dirname, "../uploads");

const usersDir = path.join(uploadBase, "users");
const clinicsDir = path.join(uploadBase, "clinics");
const clinicImagesDir = path.join(uploadBase, "clinic_images");
const certificatesDir = path.join(uploadBase, "certificates");
const productsDir = path.join(uploadBase, "products");
const othersDir = path.join(uploadBase, "others");
const progressDir = path.join(uploadBase, "progress"); // ✅ NEW for progress images

// Create all folders
[usersDir, clinicsDir, clinicImagesDir, certificatesDir, productsDir, othersDir, progressDir].forEach(makeDir);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    switch (file.fieldname) {
      case "avatar":
        cb(null, usersDir);
        break;
      case "clinicLogo":
        cb(null, clinicsDir);
        break;
      case "front":
      case "left":
      case "right":
        cb(null, clinicImagesDir);
        break;
      case "certificates":
        cb(null, certificatesDir);
        break;
      case "images":
        cb(null, productsDir);
        break;
      case "progress_images": // ✅ Progress images ka folder alag rakha
        cb(null, progressDir);
        break;
      default:
        cb(null, othersDir);
        break;
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter configuration
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "certificates") {
    // Allow PDFs and images for certificates
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Only PDF, PNG, JPG, and JPEG files are allowed for certificates!"),
        false
      );
    }
  } else {
    // For other fields allow images only
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg","image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg files are allowed!"), false);
    }
  }
};

// Init Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

module.exports = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "clinicLogo", maxCount: 1 },
  { name: "front", maxCount: 1 },
  { name: "left", maxCount: 1 },
  { name: "right", maxCount: 1 },
  { name: "certificates", maxCount: 10 },
  { name: "images", maxCount: 10 },
  { name: "progress_images", maxCount: 10 }, // ✅ progress uploads
]);
