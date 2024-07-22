const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  // verify token which is sent as Authorization in headers
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    // find user using token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = decoded._id;
    let user = await User.findById(decoded._id);
    req.user = user;
    next();
  } catch (error) {
    console.log("error", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
