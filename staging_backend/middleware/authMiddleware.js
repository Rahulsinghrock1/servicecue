require('dotenv').config();
const jwt = require("jsonwebtoken");
const BlacklistedToken = require('@middleware/tokenBlacklist');
const User = require("@models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || 'fallback_secret';

  try {
    // Debug logging in development
    if (process.env.NODE_ENV !== 'production') {
      console.log("🔑 Incoming Token:", token);
      console.log("🔑 JWT_SECRET (middleware):", secret);
    }

    // Check blacklist
 

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      console.error("❌ JWT Verification Failed:", err.message);
      return res.status(401).json({ message: `Unauthorized: ${err.message}` });
    }

    // Ensure user exists
    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
    }

    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(401).json({ message: "Unauthorized: User no longer exists" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Middleware Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authMiddleware;
