import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

//    Get all pending sellers
//    GET /api/admin/sellers/pending
//    Private/Admin
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

//     Approve seller
//     PUT /api/admin/sellers/approve/:id
//     Private/Admin
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

//    Reject seller
//    PUT /api/admin/sellers/reject/:id
//    Private/Admin
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

//    Approve customer (Admin can approve customers)
//    PUT /api/admin/customers/approve/:id
//    Private/Admin
export const approveCustomer = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const customer = await Customer.findById(id);

  if (!customer) {
    return next(new AppError("Customer not found", 404));
  }

  if (!customer.isActive) {
    customer.isActive = true;
    await customer.save();
  }

  res.status(200).json({
    success: true,
    message: "Customer approved successfully",
    customer: {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      isActive: customer.isActive,
    },
  });
});

//     Approve deliverer (Admin can approve deliverers)
//     PUT /api/admin/deliverers/approve/:id
//     Private/Admin
export const approveDeliverer = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const Deliverer = (await import("../models/Deliverer.js")).default;
  const deliverer = await Deliverer.findById(id);

  if (!deliverer) {
    return next(new AppError("Deliverer not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Deliverer approved successfully",
    deliverer,
  });
});
