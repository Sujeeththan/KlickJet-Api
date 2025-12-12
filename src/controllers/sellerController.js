import Seller from "../models/Seller.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";
import { buildQuery, buildPaginationMeta } from "../utils/queryBuilder.js";

// @desc    Get all sellers
// @route   GET /api/sellers
// @access  Private/Admin or Seller (own profile)
// @query   search, status, name, email, shopName, isActive, sort, sortOrder, page, limit
export const getAllSellers = catchAsync(async (req, res, next) => {
  // Build query using the query builder utility
  const { filter, sort, pagination } = buildQuery({
    query: req.query,
    searchFields: ["name", "email", "shopName", "phone_no", "address"], // Search across multiple fields
    filterFields: {
      status: "string",
      name: "string",
      email: "string",
      shopName: "string",
      isActive: "boolean",
    },
    roleBasedFilters: {
      seller: { _id: req.user.id }, // Sellers only see their own profile
    },
    user: req.user,
  });

  // Execute query with pagination
  const totalSellers = await Seller.countDocuments(filter);
  const sellers = await Seller.find(filter)
    .select("-password")
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort(sort)
    .populate("approvedBy", "name email");

  // Build pagination metadata
  const paginationMeta = buildPaginationMeta(
    totalSellers,
    pagination.page,
    pagination.limit
  );

  res.status(200).json({
    success: true,
    message: "Sellers fetched successfully",
    ...paginationMeta,
    sellers,
  });
});

// @desc    Get approved sellers (Public)
// @route   GET /api/sellers/public/approved
// @access  Public
export const getApprovedSellers = catchAsync(async (req, res, next) => {
  const { filter, sort, pagination } = buildQuery({
    query: req.query,
    searchFields: ["name", "shopName", "address"],
    filterFields: {
      address: "string",
      shopName: "string",
    },
    defaultFilters: {
      status: "approved",
      isActive: true,
    },
  });

  const sellers = await Seller.find(filter)
    .select("name shopName address _id email phone_no shopImage") // Public info only
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort(sort);

  const total = await Seller.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: sellers.length,
    total,
    sellers,
  });
});

// @desc    Get seller by ID
// @route   GET /api/sellers/:id
// @access  Private/Admin or Seller (own profile)
export const getSellerById = catchAsync(async (req, res, next) => {
  const seller = await Seller.findById(req.params.id)
    .select("-password")
    .populate("approvedBy", "name email");

  if (!seller) {
    return next(new AppError("Seller not found", 404));
  }

  // Sellers can only view their own profile
  if (req.user.role === "seller" && seller._id.toString() !== req.user.id) {
    return next(new AppError("Not authorized to access this seller", 403));
  }

  res.status(200).json({
    success: true,
    seller,
  });
});

// @desc    Update seller
// @route   PUT /api/sellers/:id
// @access  Private/Seller (own profile) or Admin
export const updateSeller = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  console.log(`[DEBUG] updateSeller called for ID: ${id}`);
  console.log(`[DEBUG] Request Body:`, req.body);

  const seller = await Seller.findById(id);
  if (!seller) {
    return next(new AppError("Seller not found", 404));
  }

  // Sellers can only update their own profile (and cannot change status)
  if (req.user.role === "seller") {
    if (seller._id.toString() !== req.user.id) {
      return next(new AppError("Not authorized to update this seller", 403));
    }
    // Sellers cannot update status, approvedBy, or approvedAt
    delete req.body.status;
    delete req.body.approvedBy;
    delete req.body.approvedAt;
  }

  // Don't allow updating password through this route
  if (req.body.password) {
    return next(new AppError("Password cannot be updated through this route", 400));
  }

  // Check if email is being updated and if it already exists
  if (req.body.email && req.body.email !== seller.email) {
    const existingSeller = await Seller.findOne({ 
      email: req.body.email.toLowerCase().trim(), 
      _id: { $ne: id } 
    });
    if (existingSeller) {
      return next(new AppError("Email already registered", 400));
    }
  }

  // If admin is updating status to approved, set approvedBy and approvedAt
  if (req.user.role === "admin" && req.body.status === "approved" && seller.status !== "approved") {
    req.body.approvedBy = req.user.id;
    req.body.approvedAt = new Date();
  }

  const updatedSeller = await Seller.findByIdAndUpdate(
    id,
    { ...req.body, email: req.body.email ? req.body.email.toLowerCase().trim() : undefined },
    {
      new: true,
      runValidators: true,
    }
  )
    .select("-password")
    .populate("approvedBy", "name email");

  res.status(200).json({
    success: true,
    message: "Seller updated successfully",
    seller: updatedSeller,
  });
});

// @desc    Delete seller
// @route   DELETE /api/sellers/:id
// @access  Private/Admin
export const deleteSeller = catchAsync(async (req, res, next) => {
  const seller = await Seller.findByIdAndDelete(req.params.id);

  if (!seller) {
    return next(new AppError("Seller not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Seller deleted successfully",
  });
});


