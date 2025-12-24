const express = require("express");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");
const crypto = require("crypto");

const router = express.Router();
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

// Secret key for signing URLs
const FILE_SECRET = process.env.FILE_SECRET || "my_super_secret_key";

// Helper to verify signed URL
function verifySignedUrl(filePath, expires, sig) {
  if (!expires || !sig) return false;
  if (Date.now() / 1000 > Number(expires)) return false;

  const expectedSig = crypto
    .createHmac("sha256", FILE_SECRET)
    .update(`${filePath}:${expires}`)
    .digest("hex");

  return expectedSig === sig;
}

/**
 * Route: /files/<relativePath>?expires=<timestamp>&sig=<signature>
 * Only allows image files
 * Signed URL required
 */
router.get(/^\/(.+)/, (req, res) => {
  try {
    const relativePath = req.params[0];
    const { expires, sig } = req.query;

    // Validate signed URL
    if (!verifySignedUrl(relativePath, expires, sig)) {
      return res.status(403).json({ message: "Unauthorized or expired link" });
    }

    const filePath = path.resolve(UPLOADS_DIR, relativePath);

    // Prevent directory traversal
    if (!filePath.startsWith(UPLOADS_DIR)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const contentType = mime.lookup(filePath) || "";

    // Allow images only
    if (!contentType.startsWith("image/")) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    return res.sendFile(filePath);
  } catch (err) {
    console.error("🔥 File route error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Optional: Helper to generate signed URL
router.get("/generate-signed-url/:filePath", (req, res) => {
  const filePath = req.params.filePath;

  // URL expires in 5 minutes
  const expires = Math.floor(Date.now() / 1000) + 5 * 60;

  const sig = crypto
    .createHmac("sha256", FILE_SECRET)
    .update(`${filePath}:${expires}`)
    .digest("hex");

  return res.json({
    signedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/files/${filePath}?expires=${expires}&sig=${sig}`,
    expires,
  });
});

module.exports = router;
