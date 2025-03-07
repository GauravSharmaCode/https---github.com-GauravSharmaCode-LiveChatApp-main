const expressAsyncHandler = require("express-async-handler");
const userService = require("../Services/userService");
const { UserServiceError } = require("../Services/userService");

// ✅ Login Controller
const loginController = expressAsyncHandler(async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userData = await userService.loginUser(name, password);
    res.status(200).json(userData);
  } catch (error) {
    if (error instanceof UserServiceError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error(`[LOGIN] Error: ${error.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// ✅ Register Controller
const registerController = expressAsyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newUser = await userService.registerUser(name, email, password);
    res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof UserServiceError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error(`[REGISTER] Error: ${error.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// ✅ Fetch Users Controller
const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
  try {
    const users = await userService.fetchAllUsers(
      req.query.search,
      req.user._id
    );
    res.status(200).json(users);
  } catch (error) {
    console.error(`[FETCH_USERS] Error: ${error.message}`);
    res.status(500).json({ message: "Error fetching users" });
  }
});

module.exports = {
  loginController,
  registerController,
  fetchAllUsersController,
};
