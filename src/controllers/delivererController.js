import Deliverer from "../models/Deliverer.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

// @desc    Get all deliverers
// @route   GET /api/deliverers
// @access  Private/Admin or Deliverer (own profile)
export const getAllDeliverers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // Deliverers can only see their own profile
  if (req.user.role === "deliverer") {
    filter._id = req.user.id;
  }

  if (req.query.name) {
    filter.name = { $regex: req.query.name, $options: "i" };
  }

  if (req.query.phone_no) {
    filter.phone_no = { $regex: req.query.phone_no, $options: "i" };
  }

  if (req.query.email) {
    filter.email = { $regex: req.query.email, $options: "i" };
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const deliverers = await Deliverer.find(filter)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("approvedBy", "name email");

  const totalDeliverers = await Deliverer.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "Deliverers fetched successfully",
    page,
    limit,
    totalDeliverers,
    totalPages: Math.ceil(totalDeliverers / limit),
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

