import User from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

//   Get all users (Admin only)
//   GET /api/users
//   Private/Admin
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

  if (req.query.role) {
    filter.role = req.query.role;
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

//   Get user by ID (Admin only)
//   GET /api/users/:id
//   Private/Admin
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

//   Create user (Admin only)
//   POST /api/users
//   Private/Admin
export const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Validation
  if (!name || !email || !password || !role) {
    return next(new AppError("Please provide all required fields (name, email, password, role)", 400));
  }

  // Validate role
  if (!["admin", "customer", "seller"].includes(role)) {
    return next(new AppError("Invalid role. Must be one of: admin, customer, seller", 400));
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }

  // Password validation
  if (password.length < 8) {
    return next(new AppError("Password must be at least 8 characters long", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

//   Update user (Admin only)
//   PUT /api/users/:id
//   Private/Admin
export const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, role, isActive } = req.body;

  // Don't allow updating password through this route
  if (req.body.password) {
    return next(new AppError("Password cannot be updated through this route", 400));
  }

  // Validate role if provided
  if (role && !["admin", "customer", "seller"].includes(role)) {
    return next(new AppError("Invalid role. Must be one of: admin, customer, seller", 400));
  }

  // Check if email is being updated and if it already exists
  if (email) {
    const existingUser = await User.findById(id);
    if (existingUser && email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return next(new AppError("Email already registered", 400));
      }
    }
  }

  const user = await User.findByIdAndUpdate(
    id,
    { name, email, role, isActive },
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

//   Delete user (Admin only)
//   DELETE /api/users/:id
//   Private/Admin
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
