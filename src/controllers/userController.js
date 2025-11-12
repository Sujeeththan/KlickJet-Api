import User from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

// @desc    Get all admin users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.name) {
    filter.name = { $regex: req.query.name, $options: "i" };
  }

  if (req.query.email) {
    filter.email = { $regex: req.query.email, $options: "i" };
  }

  const users = await User.find(filter)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    page,
    limit,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    users,
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Create admin user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validation - show first error only
  if (!name) {
    return next(new AppError("Name is required", 400));
  }
  if (!email) {
    return next(new AppError("Email is required", 400));
  }
  if (!password) {
    return next(new AppError("Password is required", 400));
  }

  if (password.length < 8) {
    return next(new AppError("Password must be at least 8 characters long", 400));
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: "admin",
  });

  res.status(201).json({
    success: true,
    message: "Admin user created successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, isActive } = req.body;

  // Don't allow updating password through this route
  if (req.body.password) {
    return next(new AppError("Password cannot be updated through this route", 400));
  }

  // Check if email is being updated and if it already exists
  if (email) {
    const existingUser = await User.findById(id);
    if (existingUser && email.toLowerCase().trim() !== existingUser.email) {
      const emailExists = await User.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: id } 
      });
      if (emailExists) {
        return next(new AppError("Email already registered", 400));
      }
    }
  }

  const user = await User.findByIdAndUpdate(
    id,
    { name, email: email ? email.toLowerCase().trim() : undefined, isActive },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

