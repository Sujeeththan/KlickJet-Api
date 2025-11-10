import Seller from "../models/Seller.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

//   Get all sellers (Admin only, or seller can get their own)
//   GET /api/sellers
//   Private/Admin or Seller (own profile)
export const getAllSellers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // Sellers can only see their own profile
  if (req.user.role === "seller") {
    filter._id = req.user.id;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.name) {
    filter.name = { $regex: req.query.name, $options: "i" };
  }

  if (req.query.email) {
    filter.email = { $regex: req.query.email, $options: "i" };
  }

  if (req.query.shopName) {
    filter.shopName = { $regex: req.query.shopName, $options: "i" };
  }

  const sellers = await Seller.find(filter)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("approvedBy", "name email");

  const totalSellers = await Seller.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "Sellers fetched successfully",
    page,
    limit,
    totalSellers,
    totalPages: Math.ceil(totalSellers / limit),
    sellers,
  });
});

//   Get seller by ID
//   GET /api/sellers/:id
//   Private/Admin or Seller (own profile)
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

//   Update seller
//   PUT /api/sellers/:id
//   Private/Seller (own profile) or Admin
export const updateSeller = catchAsync(async (req, res, next) => {
  const { id } = req.params;

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
    const existingSeller = await Seller.findOne({ email: req.body.email, _id: { $ne: id } });
    if (existingSeller) {
      return next(new AppError("Email already registered", 400));
    }
  }

  // If admin is updating status to approved, set approvedBy and approvedAt
  if (req.user.role === "admin" && req.body.status === "approved" && seller.status !== "approved") {
    req.body.approvedBy = req.user.id;
    req.body.approvedAt = new Date();
  }

  const updatedSeller = await Seller.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .populate("approvedBy", "name email");

  res.status(200).json({
    success: true,
    message: "Seller updated successfully",
    seller: updatedSeller,
  });
});

//   Delete seller (Admin only)
//   DELETE /api/sellers/:id
//   Private/Admin
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
