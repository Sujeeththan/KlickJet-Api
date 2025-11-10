import Deliverer from "../models/Deliverer.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

//    Get all deliverers
//    GET /api/deliverers
//    Private/Admin
export const getAllDeliverers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.name) {
    filter.name = { $regex: req.query.name, $options: "i" };
  }

  if (req.query.phone_no) {
    filter.phone_no = { $regex: req.query.phone_no, $options: "i" };
  }

  if (req.query.email) {
    filter.email = { $regex: req.query.email, $options: "i" };
  }

  const deliverers = await Deliverer.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

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

//   Get deliverer by ID
//   GET /api/deliverers/:id
//   Private/Admin
export const getDelivererById = catchAsync(async (req, res, next) => {
  const deliverer = await Deliverer.findById(req.params.id);

  if (!deliverer) {
    return next(new AppError("Deliverer not found", 404));
  }

  res.status(200).json({
    success: true,
    deliverer,
  });
});

//   Create deliverer (Admin only)
//   POST /api/deliverers
//   Private/Admin
export const createDeliverer = catchAsync(async (req, res, next) => {
  const { name, phone_no, email, vehicle_no, vehicle_type, address } = req.body;

  // Validation
  if (!name || !phone_no) {
    return next(new AppError("Please provide at least name and phone_no", 400));
  }

  const deliverer = await Deliverer.create({
    name,
    phone_no,
    email: email || "",
    vehicle_no: vehicle_no || "",
    vehicle_type: vehicle_type || "",
    address: address || "",
  });

  res.status(201).json({
    success: true,
    message: "Deliverer created successfully",
    deliverer,
  });
});

//   Update deliverer (Admin only)
//   PUT /api/deliverers/:id
//   Private/Admin
export const updateDeliverer = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deliverer = await Deliverer.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!deliverer) {
    return next(new AppError("Deliverer not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Deliverer updated successfully",
    deliverer,
  });
});

//   Delete deliverer (Admin only)
//   DELETE /api/deliverers/:id
//   Private/Admin
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
