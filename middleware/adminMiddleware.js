const jwt = require("jsonwebtoken");
const User = require("../models/user");

const adminMiddleware = async (req, res, next) => {
  // get token from cookies
  const token = req.cookies?.["access-token"];
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    // find user using token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = decoded._id;
    let user = await User.findById(decoded._id);
    // check user is admin or not
    if (user?.role !== 1) {
      return res.status(401).json({ error: "Access denied" });
    }
    // set logined user in request
    req.user = user;
    next();
  } catch (error) {
    console.log("error", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = adminMiddleware;
