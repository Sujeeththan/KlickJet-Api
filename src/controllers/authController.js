import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import Deliverer from "../models/Deliverer.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";
import { addToBlacklist } from "../middleware/auth.js";

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Send token response
const sendTokenResponse = (user, role, statusCode, res, message) => {
  const token = generateToken(user._id, role);

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: role,
  };

  // Add role-specific fields
  if (role === "admin") {
    userData.isActive = user.isActive;
  } else if (role === "customer") {
    userData.phone_no = user.phone_no;
    userData.address = user.address;
  } else if (role === "seller") {
    userData.shopName = user.shopName;
    userData.phone_no = user.phone_no;
    userData.address = user.address;
    userData.status = user.status;
  } else if (role === "deliverer") {
    userData.phone_no = user.phone_no;
    userData.vehicle_no = user.vehicle_no;
    userData.vehicle_type = user.vehicle_type;
    userData.status = user.status;
  }

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userData,
  });
};

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

// @desc    Unified User Registration (Customer, Seller, Deliverer only - Admin cannot register)
// @route   POST /api/auth/register
// @access  Public
export const register = catchAsync(async (req, res, next) => {
  const { role, name, email, password, phone_no, address, shopName, vehicle_no, vehicle_type } = req.body;

  // Validate role - Admin cannot register
  if (!role) {
    return next(new AppError("Role is required. Must be one of: customer, seller, deliverer", 400));
  }

  if (!["customer", "seller", "deliverer"].includes(role)) {
    return next(new AppError("Invalid role. Must be one of: customer, seller, deliverer. Admin registration is not allowed.", 400));
  }

  // Validate name - show first error only
  if (!name) {
    return next(new AppError("Name is required", 400));
  }
  if (name.trim().length < 2) {
    return next(new AppError("Name must be at least 2 characters long", 400));
  }
  if (name.trim().length > 50) {
    return next(new AppError("Name cannot exceed 50 characters", 400));
  }

  // Validate email
  if (!email) {
    return next(new AppError("Email is required", 400));
  }
  if (!validateEmail(email)) {
    return next(new AppError("Please provide a valid email address", 400));
  }

  // Validate password
  if (!password) {
    return next(new AppError("Password is required", 400));
  }
  if (password.length < 8) {
    return next(new AppError("Password must be at least 8 characters long", 400));
  }

  // Role-specific validations
  if (role === "customer") {
    if (!phone_no) {
      return next(new AppError("Phone number is required for customers", 400));
    }
    if (!validatePhone(phone_no)) {
      return next(new AppError("Please provide a valid phone number (10-15 digits)", 400));
    }
  }

  if (role === "seller") {
    if (!shopName) {
      return next(new AppError("Shop name is required for sellers", 400));
    }
    if (shopName.trim().length < 2) {
      return next(new AppError("Shop name must be at least 2 characters long", 400));
    }
    if (shopName.trim().length > 100) {
      return next(new AppError("Shop name cannot exceed 100 characters", 400));
    }

    if (!phone_no) {
      return next(new AppError("Phone number is required for sellers", 400));
    }
    if (!validatePhone(phone_no)) {
      return next(new AppError("Please provide a valid phone number (10-15 digits)", 400));
    }

    if (!address) {
      return next(new AppError("Address is required for sellers", 400));
    }
    if (address.trim().length === 0) {
      return next(new AppError("Address cannot be empty", 400));
    }
  }

  if (role === "deliverer") {
    if (!phone_no) {
      return next(new AppError("Phone number is required for deliverers", 400));
    }
    if (!validatePhone(phone_no)) {
      return next(new AppError("Please provide a valid phone number (10-15 digits)", 400));
    }
  }

  // Check if email already exists across all models
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });
  const existingSeller = await Seller.findOne({ email: email.toLowerCase().trim() });
  const existingDeliverer = await Deliverer.findOne({ email: email.toLowerCase().trim() });

  if (existingUser || existingCustomer || existingSeller || existingDeliverer) {
    return next(new AppError("Email already registered. Please use a different email address", 400));
  }

  // Create user based on role
  let user;
  let userRole = role;

  try {
    if (role === "customer") {
      user = await Customer.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone_no: phone_no.trim(),
        address: address ? address.trim() : "",
      });
      userRole = "customer";
    } else if (role === "seller") {
      user = await Seller.create({
        name: name.trim(),
        shopName: shopName.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone_no: phone_no.trim(),
        address: address.trim(),
        status: "pending",
      });
      userRole = "seller";
    } else if (role === "deliverer") {
      user = await Deliverer.create({
        name: name.trim(),
        email: email ? email.toLowerCase().trim() : "",
        password,
        phone_no: phone_no.trim(),
        address: address ? address.trim() : "",
        vehicle_no: vehicle_no ? vehicle_no.trim() : "",
        vehicle_type: vehicle_type ? vehicle_type.trim() : "",
        status: "pending",
      });
      userRole = "deliverer";
    }

    // For sellers and deliverers, return different response (pending approval)
    if (role === "seller" || role === "deliverer") {
      return res.status(201).json({
        success: true,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} registration successful. Your account is pending admin approval.`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: role,
          status: user.status,
          ...(role === "seller" && { shopName: user.shopName }),
        },
      });
    }

    // For customers, return token
    sendTokenResponse(
      user,
      userRole,
      201,
      res,
      `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`
    );
  } catch (error) {
    // Handle duplicate key errors (MongoDB)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(new AppError(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`, 400));
    }

    // Handle validation errors - return first error only
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      return next(new AppError(firstError.message, 400));
    }

    return next(error);
  }
});

// @desc    Unified User Login
// @route   POST /api/auth/login
// @access  Public
export const login = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Validate email
  if (!email) {
    return next(new AppError("Email is required", 400));
  }
  if (!validateEmail(email)) {
    return next(new AppError("Please provide a valid email address", 400));
  }

  // Validate password
  if (!password) {
    return next(new AppError("Password is required", 400));
  }

  // Find user based on role (if provided) or search all models
  let user;
  let userRole;

  if (role) {
    // If role is provided, search in specific model
    if (role === "admin") {
      user = await User.findOne({
        email: email.toLowerCase().trim(),
        role: "admin",
      }).select("+password");
      if (user) userRole = "admin";
    } else if (role === "customer") {
      user = await Customer.findOne({
        email: email.toLowerCase().trim(),
      }).select("+password");
      if (user) userRole = "customer";
    } else if (role === "seller") {
      user = await Seller.findOne({ email: email.toLowerCase().trim() }).select("+password");
      if (user) userRole = "seller";
    } else if (role === "deliverer") {
      user = await Deliverer.findOne({ email: email.toLowerCase().trim() }).select("+password");
      if (user) userRole = "deliverer";
    } else {
      return next(new AppError("Invalid role. Must be one of: admin, customer, seller, deliverer", 400));
    }
  } else {
    // If role is not provided, search all models
    user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "admin",
    }).select("+password");
    if (user) {
      userRole = "admin";
    } else {
      user = await Customer.findOne({
        email: email.toLowerCase().trim(),
      }).select("+password");
      if (user) {
        userRole = "customer";
      } else {
        user = await Seller.findOne({
          email: email.toLowerCase().trim(),
        }).select("+password");
        if (user) {
          userRole = "seller";
        } else {
          user = await Deliverer.findOne({
            email: email.toLowerCase().trim(),
          }).select("+password");
          if (user) {
            userRole = "deliverer";
          }
        }
      }
    }
  }

  // Check if user exists
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Check if user is active
  if (user.isActive === false) {
    return next(new AppError("Account is deactivated. Please contact administrator", 401));
  }

  // For sellers and deliverers, check if approved
  if (userRole === "seller" && user.status !== "approved") {
    return next(new AppError("Your seller account is pending admin approval. Please wait for approval", 403));
  }

  if (userRole === "deliverer" && user.status !== "approved") {
    return next(new AppError("Your deliverer account is pending admin approval. Please wait for approval", 403));
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Generate token and send response
  sendTokenResponse(
    user,
    userRole,
    200,
    res,
    `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} logged in successfully`
  );
});

// @desc    Get Current User
// @route   GET /api/auth/me
// @access  Private
export const getMe = catchAsync(async (req, res, next) => {
  let user;

  if (req.user.role === "admin") {
    user = await User.findById(req.user.id);
  } else if (req.user.role === "customer") {
    user = await Customer.findById(req.user.id);
  } else if (req.user.role === "seller") {
    user = await Seller.findById(req.user.id);
  } else if (req.user.role === "deliverer") {
    user = await Deliverer.findById(req.user.id);
  }

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: req.user.role,
  };

  if (req.user.role === "admin") {
    userData.isActive = user.isActive;
  } else if (req.user.role === "customer") {
    userData.phone_no = user.phone_no;
    userData.address = user.address;
  } else if (req.user.role === "seller") {
    userData.shopName = user.shopName;
    userData.phone_no = user.phone_no;
    userData.address = user.address;
    userData.status = user.status;
  } else if (req.user.role === "deliverer") {
    userData.phone_no = user.phone_no;
    userData.vehicle_no = user.vehicle_no;
    userData.vehicle_type = user.vehicle_type;
    userData.status = user.status;
  }

  res.status(200).json({
    success: true,
    user: userData,
  });
});

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Private
export const logout = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    addToBlacklist(token);
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

