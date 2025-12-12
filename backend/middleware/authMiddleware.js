const jwt = require("jsonwebtoken");
const BlacklistedToken = require("@models/BlacklistedToken");
const User = require("@models/User"); // Import your user model

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Check if the token is blacklisted
    const isBlacklisted = await BlacklistedToken.findOne({ where: { token } });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized: Token is blacklisted" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user still exists
    const existingUser = await User.findByPk(decoded.id);
    if (!existingUser) {
      return res.status(401).json({ message: "Unauthorized: User no longer exists" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = authMiddleware;
