const getTimestamp = () => new Date().toISOString();

/**
 * Handles 404 errors by logging a warning with the request method and original URL, and by creating a new Error object with a statusCode of 404 and passing it to next() to be handled by the error handler middleware.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const notFound = (req, res, next) => {
  console.warn(
    `[${getTimestamp()}] [404 NOT FOUND] ${req.method} ${req.originalUrl}`
  );

  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Handles errors by logging an error with the request method and original URL, and by responding with a JSON object containing the status code, error message, and error stack (if not in production environment).
 *
 * @param {Error} err - The error object created by the previous middleware.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error(
    `[${getTimestamp()}] [ERROR ${statusCode}] ${req.method} ${
      req.originalUrl
    } - ${err.message}`
  );

  res.status(statusCode).json({
    statusCode,
    message: statusCode === 500 ? "Internal Server Error" : err.message,
    // Only include stack trace in non-production environments
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
