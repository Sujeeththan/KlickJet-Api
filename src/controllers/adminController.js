import Seller from "../models/Seller.js";
import Deliverer from "../models/Deliverer.js";
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

  const deliverer = await Deliverer.findById(id);

  if (!deliverer) {
    return next(new AppError("Deliverer not found", 404));
  }

  if (deliverer.status === "rejected") {
    return next(new AppError("Deliverer is already rejected", 400));
  }

  deliverer.status = "rejected";
  await deliverer.save();

  res.status(200).json({
    success: true,
    message: "Deliverer rejected successfully",
    deliverer: {
      id: deliverer._id,
      name: deliverer.name,
      email: deliverer.email,
      status: deliverer.status,
    },
  });
});

