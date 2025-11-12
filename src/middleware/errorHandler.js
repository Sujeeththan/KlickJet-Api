// Custom Error Class for API errors
export class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.errors = errors; // For validation errors

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Mongoose CastError (Invalid ID)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle Mongoose Duplicate Key Error
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || "field";
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || err.keyValue[field];
  
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use another ${field}.`;
  return new AppError(message, 400);
};

// Handle Mongoose Validation Error - Return first error only
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors);
  if (errors.length === 0) {
    return new AppError("Validation failed", 400);
  }
  
  // Return only the first validation error for clarity
  const firstError = errors[0];
  return new AppError(firstError.message, 400);
};

// Handle JWT Errors
const handleJWTError = () => {
  return new AppError("Invalid token. Please log in again!", 401);
};

const handleJWTExpiredError = () => {
  return new AppError("Your token has expired! Please log in again.", 401);
};

// Send Error Response in Development
const sendErrorDev = (err, res) => {
  const response = {
    success: false,
    statusCode: err.statusCode || 500,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack, error: err }),
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(err.statusCode || 500).json(response);
};

// Send Error Response in Production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response = {
      success: false,
      statusCode: err.statusCode || 500,
      message: err.message,
    };

    if (err.errors) {
      response.errors = err.errors;
    }

    res.status(err.statusCode || 500).json(response);
  } else {
    // Programming or other unknown error: don't leak error details
    console.error("ERROR ", err);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Something went wrong!",
    });
  }
};

// Global Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    // Handle specific error types
    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }

    if (error.name === "JsonWebTokenError") {
      error = handleJWTError();
    }

    if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};

// Async Error Handler Wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// 404 Not Found Handler
export const notFound = (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};

