const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.error(`[${new Date().toISOString()}] [ERROR] No token provided`);
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.error(`[${new Date().toISOString()}] [ERROR] User not found`);
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    console.info(
      `[${new Date().toISOString()}] [AUTH SUCCESS] User: ${req.user._id}`
    );
    next();
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] [ERROR] Token verification failed: ${
        error.message
      }`
    );
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

module.exports = { protect };
