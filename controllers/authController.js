import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";

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

// @desc    Register Customer
// @route   POST /api/auth/register/customer
// @access  Public
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone_no, address } = req.body;

    // Validation
    if (!name || !email || !password || !phone_no) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, email, password, phone_no)",
      });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check if email exists in User or Seller models
    const existingUser = await User.findOne({ email });
    const existingSeller = await Seller.findOne({ email });
    if (existingUser || existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
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
  } catch (error) {
    console.error("Register Customer Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// @desc    Login Customer
// @route   POST /api/auth/login/customer
// @access  Public
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find customer with password field
    const customer = await Customer.findOne({ email }).select("+password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if customer is active
    if (!customer.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check password
    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token and send response
    sendTokenResponse(customer, "customer", 200, res, "Customer logged in successfully");
  } catch (error) {
    console.error("Login Customer Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

// @desc    Register Seller (Pending Status)
// @route   POST /api/auth/register/seller
// @access  Public
export const registerSeller = async (req, res) => {
  try {
    const { name, shopName, email, password, phone_no, address } = req.body;

    // Validation
    if (!name || !shopName || !email || !password || !phone_no || !address) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, shopName, email, password, phone_no, address)",
      });
    }

    // Check if email already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check if email exists in User or Customer models
    const existingUser = await User.findOne({ email });
    const existingCustomer = await Customer.findOne({ email });
    if (existingUser || existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
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
  } catch (error) {
    console.error("Register Seller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// @desc    Login Seller (Only if Approved)
// @route   POST /api/auth/login/seller
// @access  Public
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find seller with password field
    const seller = await Seller.findOne({ email }).select("+password");

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if seller is approved
    if (seller.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval. Please wait for approval.",
      });
    }

    // Check if seller is active
    if (!seller.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check password
    const isMatch = await seller.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token and send response
    sendTokenResponse(seller, "seller", 200, res, "Seller logged in successfully");
  } catch (error) {
    console.error("Login Seller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

// @desc    Register Admin (Usually done manually or via seed)
// @route   POST /api/auth/register/admin
// @access  Public (In production, this should be protected)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, email, password)",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check if email exists in Customer or Seller models
    const existingCustomer = await Customer.findOne({ email });
    const existingSeller = await Seller.findOne({ email });
    if (existingCustomer || existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
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
  } catch (error) {
    console.error("Register Admin Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// @desc    Login Admin
// @route   POST /api/auth/login/admin
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find admin user with password field
    const admin = await User.findOne({ email, role: "admin" }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token and send response
    sendTokenResponse(admin, "admin", 200, res, "Admin logged in successfully");
  } catch (error) {
    console.error("Login Admin Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

// @desc    Approve Seller (Admin Only)
// @route   PUT /api/auth/seller/approve/:id
// @access  Private/Admin
export const approveSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Seller is already approved",
      });
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
  } catch (error) {
    console.error("Approve Seller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during approval",
    });
  }
};

// @desc    Reject Seller (Admin Only)
// @route   PUT /api/auth/seller/reject/:id
// @access  Private/Admin
export const rejectSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
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
  } catch (error) {
    console.error("Reject Seller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during rejection",
    });
  }
};

// @desc    Get Pending Sellers (Admin Only)
// @route   GET /api/auth/sellers/pending
// @access  Private/Admin
export const getPendingSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({ status: "pending" }).select("-password");

    res.status(200).json({
      success: true,
      count: sellers.length,
      sellers,
    });
  } catch (error) {
    console.error("Get Pending Sellers Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get Current User
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    let user;

    if (req.user.role === "admin") {
      user = await User.findById(req.user.id);
    } else if (req.user.role === "customer") {
      user = await Customer.findById(req.user.id);
    } else if (req.user.role === "seller") {
      user = await Seller.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
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
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

