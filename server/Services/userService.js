const UserModel = require("../models/userModel");
const generateToken = require("../Config/generateToken");

class UserServiceError extends Error {
  /**
   * Creates a new instance of the UserServiceError class.
   *
   * @param {string} message - The error message to be displayed.
   * @param {number} statusCode - The HTTP status code associated with this error.
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Authenticates a user with the provided username and password.
 *
 * @param {string} name - The username of the user attempting to log in.
 * @param {string} password - The password of the user attempting to log in.
 * @returns {Object} - An object containing the user details and authentication token if login is successful.
 * @throws {UserServiceError} - Throws an error if the username or password is invalid.
 */
const loginUser = async (name, password) => {
  const user = await UserModel.findOne({ name });

  if (!user || !(await user.matchPassword(password))) {
    throw new UserServiceError("Invalid username or password", 401);
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  };
};

/**
 * Registers a new user with the provided name, email, and password.
 *
 * @param {string} name - The desired username for the new user.
 * @param {string} email - The email address of the new user.
 * @param {string} password - The password for the new user account.
 * @returns {Object} - An object containing the registered user's details and authentication token.
 * @throws {UserServiceError} - Throws an error if the email or username already exists, or if registration fails.
 */
const registerUser = async (name, email, password) => {
  // Check if email or username exists
  if (await UserModel.findOne({ email })) {
    throw new UserServiceError("User already exists", 409);
  }
  if (await UserModel.findOne({ name })) {
    throw new UserServiceError("Username already taken", 409);
  }

  // Create user
  const user = await UserModel.create({ name, email, password });
  if (!user) {
    throw new UserServiceError("Registration failed", 400);
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  };
};

/**
 * Retrieves all users in the database that match the given search query, excluding the given user ID.
 *
 * @param {string} [searchQuery] - The search query to filter users by.
 * @param {string} currentUserId - The ID of the user to exclude from the results.
 * @returns {Promise<Array<Object>>} - An array of user objects that match the search query, excluding the given user ID.
 */
const fetchAllUsers = async (searchQuery, currentUserId) => {
  const filter = searchQuery
    ? {
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
        ],
      }
    : {};

  return await UserModel.find(filter).find({ _id: { $ne: currentUserId } });
};

module.exports = {
  loginUser,
  registerUser,
  fetchAllUsers,
  UserServiceError,
};
