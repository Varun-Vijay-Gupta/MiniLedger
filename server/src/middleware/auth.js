const jwt = require("jsonwebtoken");
const config = require("../config");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.sub, phone: payload.phone };
    return next();
  } catch (_err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = {
  requireAuth,
};
