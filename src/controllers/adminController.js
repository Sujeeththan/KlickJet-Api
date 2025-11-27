import Seller from "../models/Seller.js";
import Deliverer from "../models/Deliverer.js";
import User from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

// @desc    Get all pending sellers
// @route   GET /api/admin/sellers/pending
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

// @desc    Approve seller
// @route   PUT /api/admin/sellers/:id/approve
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
      approvedBy: seller.approvedBy,
    },
  });
});

// @desc    Reject seller
// @route   PUT /api/admin/sellers/:id/reject
// @access  Private/Admin
export const rejectSeller = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason || rejectionReason.trim() === "") {
    return next(new AppError("Rejection reason is required", 400));
  }

  const seller = await Seller.findById(id);

  if (!seller) {
    return next(new AppError("Seller not found", 404));
  }

  if (seller.status === "rejected") {
    return next(new AppError("Seller is already rejected", 400));
  }

  seller.status = "rejected";
  seller.rejectionReason = rejectionReason;
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
      rejectionReason: seller.rejectionReason,
    },
  });
});

// @desc    Get all pending deliverers
// @route   GET /api/admin/deliverers/pending
// @access  Private/Admin
export const getPendingDeliverers = catchAsync(async (req, res, next) => {
  const deliverers = await Deliverer.find({ status: "pending" })
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: deliverers.length,
    deliverers,
  });
});

// @desc    Approve deliverer
// @route   PUT /api/admin/deliverers/:id/approve
// @access  Private/Admin
export const approveDeliverer = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deliverer = await Deliverer.findById(id);

  if (!deliverer) {
    return next(new AppError("Deliverer not found", 404));
  }

  if (deliverer.status === "approved") {
    return next(new AppError("Deliverer is already approved", 400));
  }

  deliverer.status = "approved";
  deliverer.approvedBy = req.user.id;
  deliverer.approvedAt = new Date();

  await deliverer.save();

  res.status(200).json({
    success: true,
    message: "Deliverer approved successfully",
    deliverer: {
      id: deliverer._id,
      name: deliverer.name,
      email: deliverer.email,
      phone_no: deliverer.phone_no,
      status: deliverer.status,
      approvedAt: deliverer.approvedAt,
      approvedBy: deliverer.approvedBy,
    },
  });
});

// @desc    Reject deliverer
// @route   PUT /api/admin/deliverers/:id/reject
// @access  Private/Admin
export const rejectDeliverer = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason || rejectionReason.trim() === "") {
    return next(new AppError("Rejection reason is required", 400));
  }

  const deliverer = await Deliverer.findById(id);

  if (!deliverer) {
    return next(new AppError("Deliverer not found", 404));
  }

  if (deliverer.status === "rejected") {
    return next(new AppError("Deliverer is already rejected", 400));
  }

  deliverer.status = "rejected";
  deliverer.rejectionReason = rejectionReason;
  await deliverer.save();

  res.status(200).json({
    success: true,
    message: "Deliverer rejected successfully",
    deliverer: {
      id: deliverer._id,
      name: deliverer.name,
      email: deliverer.email,
      status: deliverer.status,
      rejectionReason: deliverer.rejectionReason,
    },
  });
});

// @desc    Delete seller
// @route   DELETE /api/admin/sellers/:id
// @access  Private/Admin
export const deleteSeller = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const seller = await Seller.findById(id);

  if (!seller) {
    return next(new AppError("Seller not found", 404));
  }

  await Seller.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Seller deleted successfully",
  });
});

// @desc    Delete deliverer
// @route   DELETE /api/admin/deliverers/:id
// @access  Private/Admin
export const deleteDeliverer = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deliverer = await Deliverer.findById(id);

  if (!deliverer) {
    return next(new AppError("Deliverer not found", 404));
  }

  await Deliverer.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Deliverer deleted successfully",
  });
});

// @desc    Get all sellers
// @route   GET /api/admin/sellers
// @access  Private/Admin
export const getAllSellers = catchAsync(async (req, res, next) => {
  const sellers = await Seller.find()
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: sellers.length,
    sellers,
  });
});

// @desc    Get all deliverers
// @route   GET /api/admin/deliverers
// @access  Private/Admin
export const getAllDeliverers = catchAsync(async (req, res, next) => {
  const deliverers = await Deliverer.find()
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: deliverers.length,
    deliverers,
  });
});

// @desc    Get all users (customers, sellers, deliverers)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = catchAsync(async (req, res, next) => {
  const [customers, sellers, deliverers] = await Promise.all([
    User.find().select("-password").sort({ createdAt: -1 }),
    Seller.find().select("-password").sort({ createdAt: -1 }),
    Deliverer.find().select("-password").sort({ createdAt: -1 }),
  ]);

  const allUsers = [
    ...customers.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.isActive ? "active" : "inactive",
      createdAt: user.createdAt,
      type: "customer"
    })),
    ...sellers.map(seller => ({
      _id: seller._id,
      name: seller.name,
      shopName: seller.shopName,
      email: seller.email,
      phone_no: seller.phone_no,
      address: seller.address,
      role: "seller",
      status: seller.status,
      rejectionReason: seller.rejectionReason,
      createdAt: seller.createdAt,
      type: "seller"
    })),
    ...deliverers.map(deliverer => ({
      _id: deliverer._id,
      name: deliverer.name,
      email: deliverer.email,
      phone_no: deliverer.phone_no,
      vehicle_type: deliverer.vehicle_type,
      vehicle_no: deliverer.vehicle_no,
      role: "deliverer",
      status: deliverer.status,
      rejectionReason: deliverer.rejectionReason,
      createdAt: deliverer.createdAt,
      type: "deliverer"
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json({
    success: true,
    count: allUsers.length,
    users: allUsers,
  });
});

