import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import Deliverer from "../models/Deliverer.js";
import { AppError } from "./errorHandler.js";
import { catchAsync } from "./errorHandler.js";

// Token blacklist to store invalidated tokens
const tokenBlacklist = new Set();

export const authenticate = (req, res, next) => {
  
  console.log("Auth middleware works");
  next();
};

// Add token to blacklist
export const addToBlacklist = (token) => {
  tokenBlacklist.add(token);
};

// Check if token is blacklisted
export const isBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// Verify JWT token middleware
export const verifyToken = catchAsync(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  // Check if token is blacklisted
  if (isBlacklisted(token)) {
    return next(
      new AppError("Token has been invalidated. Please login again.", 401)
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user based on role
    let user;
    if (decoded.role === "admin") {
      user = await User.findById(decoded.id);
    } else if (decoded.role === "customer") {
      user = await Customer.findById(decoded.id);
    } else if (decoded.role === "seller") {
      user = await Seller.findById(decoded.id);
    } else if (decoded.role === "deliverer") {
      user = await Deliverer.findById(decoded.id);
    } else {
      return next(new AppError("Invalid role", 401));
    }

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    // Check if user is active (if the model has isActive field)
    if (user.isActive === false) {
      return next(new AppError("Account is deactivated", 401));
    }

    // Attach user to request
    req.user = {
      id: user._id,
      role: decoded.role,
      email: user.email,
      status: user.status,
    };

    console.log("🔐 User authenticated:", {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    });

    // For sellers, check approval status and attach to request
    if (decoded.role === "seller" && user.status !== "approved") {
      req.user.isApproved = false;
    } else if (decoded.role === "seller") {
      req.user.isApproved = true;
    }

    // For deliverers, check approval status if exists
    if (decoded.role === "deliverer" && user.status && user.status !== "approved") {
      req.user.isApproved = false;
    } else if (decoded.role === "deliverer") {
      req.user.isApproved = user.status === "approved" || !user.status;
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again!", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError("Your token has expired! Please log in again.", 401)
      );
    }
    return next(new AppError("Not authorized to access this route", 401));
  }
});

// Optional authentication middleware - doesn't fail if no token, but attaches user if token exists
export const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // If no token, just continue without attaching user
  if (!token) {
    return next();
  }

  // Check if token is blacklisted
  if (isBlacklisted(token)) {
    // Don't fail, just continue without user
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user based on role
    let user;
    if (decoded.role === "admin") {
      user = await User.findById(decoded.id);
    } else if (decoded.role === "customer") {
      user = await Customer.findById(decoded.id);
    } else if (decoded.role === "seller") {
      user = await Seller.findById(decoded.id);
    } else if (decoded.role === "deliverer") {
      user = await Deliverer.findById(decoded.id);
    }

    if (user && (user.isActive !== false)) {
      // Attach user to request
      req.user = {
        id: user._id,
        role: decoded.role,
        email: user.email,
        status: user.status,
      };

      // For sellers, check approval status and attach to request
      if (decoded.role === "seller" && user.status !== "approved") {
        req.user.isApproved = false;
      } else if (decoded.role === "seller") {
        req.user.isApproved = true;
      }

      // For deliverers, check approval status if exists
      if (decoded.role === "deliverer" && user.status && user.status !== "approved") {
        req.user.isApproved = false;
      } else if (decoded.role === "deliverer") {
        req.user.isApproved = user.status === "approved" || !user.status;
      }
    }

    next();
  } catch (error) {
    // Don't fail on token errors, just continue without user
    next();
  }
});



// Restrict to certain roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

export const protect = verifyToken;
