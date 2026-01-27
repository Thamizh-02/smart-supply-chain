const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  // Remove "Bearer " prefix if present
  if (token.startsWith("Bearer ")) {
    token = token.substring(7);
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Token verification error:", err.message);
    res.status(401).json({ msg: "Invalid token", error: err.message });
  }
};
