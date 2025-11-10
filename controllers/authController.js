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

//     Register Customer
//     POST /api/auth/register/customer
//     Public
export const registerCustomer = catchAsync(async (req, res, next) => {
  const { name, email, password, phone_no, address } = req.body;

  // Validation
  if (!name || !email || !password || !phone_no) {
    return next(new AppError("Please provide all required fields (name, email, password, phone_no)", 400));
  }

  // Check if email already exists
  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    return next(new AppError("Email already registered", 400));
  }

  // Check if email exists in User or Seller models
  const existingUser = await User.findOne({ email });
  const existingSeller = await Seller.findOne({ email });
  if (existingUser || existingSeller) {
    return next(new AppError("Email already registered", 400));
  }

  // Password validation
  if (password.length < 8) {
    return next(new AppError("Password must be at least 8 characters long", 400));
  }

  // Create customer
  const customer = await Customer.create({
    name,
    email,
    password,
    phone_no,
    address: address || "",
  });

  // Generate token and send response
  sendTokenResponse(customer, "customer", 201, res, "Customer registered successfully");
});

//    Login Customer
//    POST /api/auth/login/customer
//    Public
export const loginCustomer = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Find customer with password field
  const customer = await Customer.findOne({ email }).select("+password");

  if (!customer) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Check if customer is active
  if (!customer.isActive) {
    return next(new AppError("Account is deactivated", 401));
  }

  // Check password
  const isMatch = await customer.comparePassword(password);
  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Generate token and send response
  sendTokenResponse(customer, "customer", 200, res, "Customer logged in successfully");
});

//    Register Seller (Pending Status)
//    POST /api/auth/register/seller
//    Public
export const registerSeller = catchAsync(async (req, res, next) => {
  const { name, shopName, email, password, phone_no, address } = req.body;

  // Validation
  if (!name || !shopName || !email || !password || !phone_no || !address) {
    return next(new AppError("Please provide all required fields (name, shopName, email, password, phone_no, address)", 400));
  }

  // Check if email already exists
  const existingSeller = await Seller.findOne({ email });
  if (existingSeller) {
    return next(new AppError("Email already registered", 400));
  }

  // Check if email exists in User or Customer models
  const existingUser = await User.findOne({ email });
  const existingCustomer = await Customer.findOne({ email });
  if (existingUser || existingCustomer) {
    return next(new AppError("Email already registered", 400));
  }

  // Password validation
  if (password.length < 8) {
    return next(new AppError("Password must be at least 8 characters long", 400));
  }

  // Create seller with pending status
  const seller = await Seller.create({
    name,
    shopName,
    email,
    password,
    phone_no,
    address,
    status: "pending",
  });

  res.status(201).json({
    success: true,
    message: "Seller registration successful. Your account is pending admin approval.",
    seller: {
      id: seller._id,
      name: seller.name,
      shopName: seller.shopName,
      email: seller.email,
      status: seller.status,
    },
  });
});

//    Login Seller (Only if Approved)
//    POST /api/auth/login/seller
//    Public
export const loginSeller = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Find seller with password field
  const seller = await Seller.findOne({ email }).select("+password");

  if (!seller) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Check if seller is approved
  if (seller.status !== "approved") {
    return next(new AppError("Your account is pending admin approval. Please wait for approval.", 403));
  }

  // Check if seller is active
  if (!seller.isActive) {
    return next(new AppError("Account is deactivated", 401));
  }

  // Check password
  const isMatch = await seller.comparePassword(password);
  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Generate token and send response
  sendTokenResponse(seller, "seller", 200, res, "Seller logged in successfully");
});

//    Register Admin (Usually done manually or via seed)
//    POST /api/auth/register/admin
//    Public (In production, this should be protected)
export const registerAdmin = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return next(new AppError("Please provide all required fields (name, email, password)", 400));
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }

  // Check if email exists in Customer or Seller models
  const existingCustomer = await Customer.findOne({ email });
  const existingSeller = await Seller.findOne({ email });
  if (existingCustomer || existingSeller) {
    return next(new AppError("Email already registered", 400));
  }

  // Password validation
  if (password.length < 8) {
    return next(new AppError("Password must be at least 8 characters long", 400));
  }

  // Create admin user
  const admin = await User.create({
    name,
    email,
    password,
    role: "admin",
  });

  // Generate token and send response
  sendTokenResponse(admin, "admin", 201, res, "Admin registered successfully");
});

//    Login Admin
//    POST /api/auth/login/admin
//    Public
export const loginAdmin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Find admin user with password field
  const admin = await User.findOne({ email, role: "admin" }).select("+password");

  if (!admin) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Check if admin is active
  if (!admin.isActive) {
    return next(new AppError("Account is deactivated", 401));
  }

  // Check password
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Generate token and send response
  sendTokenResponse(admin, "admin", 200, res, "Admin logged in successfully");
});

//    Approve Seller (Admin Only)
//    PUT /api/auth/seller/approve/:id
//    Private/Admin
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
  seller.approvedBy = req.user.id; // Admin ID from auth middleware
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

//   Reject Seller (Admin Only)
//   PUT /api/auth/seller/reject/:id
//   Private/Admin
export const rejectSeller = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const seller = await Seller.findById(id);

  if (!seller) {
    return next(new AppError("Seller not found", 404));
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

//   Get Pending Sellers (Admin Only)
//   GET /api/auth/sellers/pending
//   Private/Admin
export const getPendingSellers = catchAsync(async (req, res, next) => {
  const sellers = await Seller.find({ status: "pending" }).select("-password");

  res.status(200).json({
    success: true,
    count: sellers.length,
    sellers,
  });
});

//   Get Current User
//   GET /api/auth/me
//   Private
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

//   Logout User
//   POST /api/auth/logout
//   Private
export const logout = catchAsync(async (req, res, next) => {
  // Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    // Add token to blacklist
    addToBlacklist(token);
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

