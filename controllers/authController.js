import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
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
  if (role === "customer") {
    userData.phone_no = user.phone_no;
    userData.address = user.address;
  } else if (role === "seller") {
    userData.shopName = user.shopName;
    userData.phone_no = user.phone_no;
    userData.address = user.address;
    userData.status = user.status;
  }

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userData,
  });
};

// Validation helper function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

// @desc    Unified User Registration
// @route   POST /api/users/register
// @access  Public
export const register = catchAsync(async (req, res, next) => {
  const { role, name, email, password, phone_no, address, shopName } = req.body;

  // Validate role
  if (!role) {
    return next(
      new AppError(
        "Role is required. Must be one of: admin, seller, customer",
        400
      )
    );
  }

  if (!["admin", "seller", "customer"].includes(role)) {
    return next(
      new AppError("Invalid role. Must be one of: admin, seller, customer", 400)
    );
  }

  // Validate common fields
  const errors = [];

  if (!name) {
    errors.push("Name is required");
  } else if (name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  } else if (name.trim().length > 50) {
    errors.push("Name cannot exceed 50 characters");
  }

  if (!email) {
    errors.push("Email is required");
  } else if (!validateEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  if (!password) {
    errors.push("Password is required");
  } else if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Role-specific validations
  if (role === "customer") {
    if (!phone_no) {
      errors.push("Phone number is required for customers");
    } else if (!validatePhone(phone_no)) {
      errors.push("Please provide a valid phone number (10-15 digits)");
    }
  }

  if (role === "seller") {
    if (!shopName) {
      errors.push("Shop name is required for sellers");
    } else if (shopName.trim().length < 2) {
      errors.push("Shop name must be at least 2 characters long");
    } else if (shopName.trim().length > 100) {
      errors.push("Shop name cannot exceed 100 characters");
    }

    if (!phone_no) {
      errors.push("Phone number is required for sellers");
    } else if (!validatePhone(phone_no)) {
      errors.push("Please provide a valid phone number (10-15 digits)");
    }

    if (!address) {
      errors.push("Address is required for sellers");
    } else if (address.trim().length === 0) {
      errors.push("Address cannot be empty");
    }
  }

  // Return all validation errors at once
  if (errors.length > 0) {
    return next(new AppError(errors.join(". "), 400));
  }

  // Check if email already exists across all models
  const existingUser = await User.findOne({ email });
  const existingCustomer = await Customer.findOne({ email });
  const existingSeller = await Seller.findOne({ email });

  if (existingUser || existingCustomer || existingSeller) {
    return next(
      new AppError(
        "Email already registered. Please use a different email address",
        400
      )
    );
  }

  // Create user based on role
  let user;
  let userRole = role;

  try {
    if (role === "admin") {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: "admin",
      });
    } else if (role === "customer") {
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
    }

    // For sellers, return different response (pending approval)
    if (role === "seller") {
      return res.status(201).json({
        success: true,
        message:
          "Seller registration successful. Your account is pending admin approval.",
        user: {
          id: user._id,
          name: user.name,
          shopName: user.shopName,
          email: user.email,
          role: "seller",
          status: user.status,
        },
      });
    }

    // For admin and customer, return token
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
      return next(
        new AppError(
          `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
          400
        )
      );
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return next(new AppError(validationErrors.join(". "), 400));
    }

    return next(error);
  }
});

// @desc    Unified User Login
// @route   POST /api/users/login
// @access  Public
export const login = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Validate required fields
  const errors = [];

  if (!email) {
    errors.push("Email is required");
  } else if (!validateEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  if (!password) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(". "), 400));
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
      user = await Seller.findOne({ email: email.toLowerCase().trim() }).select(
        "+password"
      );
      if (user) userRole = "seller";
    } else {
      return next(
        new AppError(
          "Invalid role. Must be one of: admin, seller, customer",
          400
        )
      );
    }
  } else {
    // If role is not provided, search all models
    user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password"
    );
    if (user) {
      userRole = user.role || "admin";
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
        }
      }
    }
  }

  // Check if user exists
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(
      new AppError("Account is deactivated. Please contact administrator", 401)
    );
  }

  // For sellers, check if approved
  if (userRole === "seller" && user.status !== "approved") {
    return next(
      new AppError(
        "Your seller account is pending admin approval. Please wait for approval",
        403
      )
    );
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
    `${
      userRole.charAt(0).toUpperCase() + userRole.slice(1)
    } logged in successfully`
  );
});

// @desc    Approve Seller (Admin Only)
// @route   PUT /api/auth/seller/approve/:id
// @access  Private/Admin
export const approveSeller = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const seller = await Seller.findById(id);

  if (!seller) {
    return next(new AppError("Seller not found", 404));
  }

  if (seller.status === "approved") {
    return next(new AppError("Seller is already approved", 400));
  }

  seller.status = "approved";
  seller.approvedBy = req.user.id;
  seller.approvedAt = new Date();

  await seller.save();

  res.status(200).json({
    success: true,
    message: "Seller approved successfully",
    seller: {
      id: seller._id,
      name: seller.name,
      shopName: seller.shopName,
      email: seller.email,
      status: seller.status,
      approvedAt: seller.approvedAt,
    },
  });
});

// @desc    Reject Seller (Admin Only)
// @route   PUT /api/auth/seller/reject/:id
// @access  Private/Admin
export const rejectSeller = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const seller = await Seller.findById(id);

  if (!seller) {
    return next(new AppError("Seller not found", 404));
  }

  if (seller.status === "rejected") {
    return next(new AppError("Seller is already rejected", 400));
  }

  seller.status = "rejected";
  await seller.save();

  res.status(200).json({
    success: true,
    message: "Seller rejected successfully",
    seller: {
      id: seller._id,
      name: seller.name,
      shopName: seller.shopName,
      email: seller.email,
      status: seller.status,
    },
  });
});

// @desc    Get Pending Sellers (Admin Only)
// @route   GET /api/auth/sellers/pending
// @access  Private/Admin
export const getPendingSellers = catchAsync(async (req, res, next) => {
  const sellers = await Seller.find({ status: "pending" })
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: sellers.length,
    sellers,
  });
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

  if (req.user.role === "customer") {
    userData.phone_no = user.phone_no;
    userData.address = user.address;
  } else if (req.user.role === "seller") {
    userData.shopName = user.shopName;
    userData.phone_no = user.phone_no;
    userData.address = user.address;
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
