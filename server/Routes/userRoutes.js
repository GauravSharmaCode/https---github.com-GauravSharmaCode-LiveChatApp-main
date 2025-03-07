const express = require("express");
const {
  loginController,
  registerController,
  fetchAllUsersController,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Auth routes
router
  .route("/login")
  .post(loginController) // ✅ Handles POST requests
  .all((req, res) => {
    // ❌ Rejects GET and other methods
    res.status(405).json({ message: "Method Not Allowed" });
  });

router
  .route("/register")
  .post(registerController) // ✅ Handles POST requests
  .all((req, res) => {
    // ❌ Rejects GET and other methods
    res.status(405).json({ message: "Method Not Allowed" });
  });

// User routes
router.get("/", protect, fetchAllUsersController);
module.exports = router;
