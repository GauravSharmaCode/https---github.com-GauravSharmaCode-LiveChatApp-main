const jwt = require("jsonwebtoken");

/**
 * Generates a JWT token given the user's id
 *
 * @param {string} id - User's id
 * @returns {string} A JWT token
 */
const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  console.info(`[JWT_GENERATED] User: ${id}, Token: ${token}`);

  return token;
};

module.exports = generateToken;
