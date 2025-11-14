import Deliverer from "../models/Deliverer.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";
import { buildQuery, buildPaginationMeta } from "../utils/queryBuilder.js";

// @desc    Get all deliverers
// @route   GET /api/deliverers
// @access  Private/Admin or Deliverer (own profile)
// @query   search, name, email, phone_no, status, vehicle_no, vehicle_type, isActive, sort, sortOrder, page, limit
export const getAllDeliverers = catchAsync(async (req, res, next) => {
  // Build query using the query builder utility
  const { filter, sort, pagination } = buildQuery({
    query: req.query,
    searchFields: ["name", "email", "phone_no", "address", "vehicle_no", "vehicle_type"], // Search across multiple fields
    filterFields: {
      name: "string",
      email: "string",
      phone_no: "string",
      status: "string",
      vehicle_no: "string",
      vehicle_type: "string",
      isActive: "boolean",
    },
    roleBasedFilters: {
      deliverer: { _id: req.user.id }, // Deliverers only see their own profile
    },
    user: req.user,
  });

  // Execute query with pagination
  const totalDeliverers = await Deliverer.countDocuments(filter);
  const deliverers = await Deliverer.find(filter)
    .select("-password")
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort(sort)
    .populate("approvedBy", "name email");

  // Build pagination metadata
  const paginationMeta = buildPaginationMeta(
    totalDeliverers,
    pagination.page,
    pagination.limit
  );

  res.status(200).json({
    success: true,
    message: "Deliverers fetched successfully",
    ...paginationMeta,
    deliverers,
  });
});

// @desc    Get deliverer by ID
// @route   GET /api/deliverers/:id
// @access  Private/Admin or Deliverer (own profile)
export const getDelivererById = catchAsync(async (req, res, next) => {
  const deliverer = await Deliverer.findById(req.params.id)
    .select("-password")
    .populate("approvedBy", "name email");

  if (!deliverer) {
    return next(new AppError("Deliverer not found", 404));
  }

  // Deliverers can only view their own profile
  if (req.user.role === "deliverer" && deliverer._id.toString() !== req.user.id) {
    return next(new AppError("Not authorized to access this deliverer", 403));
  }

  res.status(200).json({
    success: true,
    deliverer,
  });
});

// @desc    Update deliverer
// @route   PUT /api/deliverers/:id
// @access  Private/Deliverer (own profile) or Admin
export const updateDeliverer = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deliverer = await Deliverer.findById(id);
  if (!deliverer) {
    return next(new AppError("Deliverer not found", 404));
  }

  // Deliverers can only update their own profile (and cannot change status)
  if (req.user.role === "deliverer") {
    if (deliverer._id.toString() !== req.user.id) {
      return next(new AppError("Not authorized to update this deliverer", 403));
    }
    // Deliverers cannot update status, approvedBy, or approvedAt
    delete req.body.status;
    delete req.body.approvedBy;
    delete req.body.approvedAt;
  }

  // Don't allow updating password through this route
  if (req.body.password) {
    return next(new AppError("Password cannot be updated through this route", 400));
  }

  // Check if email is being updated and if it already exists
  if (req.body.email && req.body.email !== deliverer.email) {
    const existingDeliverer = await Deliverer.findOne({ 
      email: req.body.email.toLowerCase().trim(), 
      _id: { $ne: id } 
    });
    if (existingDeliverer) {
      return next(new AppError("Email already registered", 400));
    }
  }

  // If admin is updating status to approved, set approvedBy and approvedAt
  if (req.user.role === "admin" && req.body.status === "approved" && deliverer.status !== "approved") {
    req.body.approvedBy = req.user.id;
    req.body.approvedAt = new Date();
  }

  const updatedDeliverer = await Deliverer.findByIdAndUpdate(
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
    message: "Deliverer updated successfully",
    deliverer: updatedDeliverer,
  });
});

// @desc    Delete deliverer
// @route   DELETE /api/deliverers/:id
// @access  Private/Admin
export const deleteDeliverer = catchAsync(async (req, res, next) => {
  const deliverer = await Deliverer.findByIdAndDelete(req.params.id);

  if (!deliverer) {
    return next(new AppError("Deliverer not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Deliverer deleted successfully",
  });
});


