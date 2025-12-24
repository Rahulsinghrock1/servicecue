const tokenBlacklist = new Set();
module.exports = {
  addToken: (token) => tokenBlacklist.add(token),
  isTokenBlacklisted: (token) => tokenBlacklist.has(token)
};