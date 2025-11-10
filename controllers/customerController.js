import Customer from "../models/Customer.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

// @desc    Get all customers (Admin only, or customer can get their own)
// @route   GET /api/customers
// @access  Private/Admin or Customer (own profile)
export const getAllCustomers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // Customers can only see their own profile
  if (req.user.role === "customer") {
    filter._id = req.user.id;
  }

  if (req.query.name) {
    filter.name = { $regex: req.query.name, $options: "i" };
  }

  if (req.query.email) {
    filter.email = { $regex: req.query.email, $options: "i" };
  }

  if (req.query.phone_no) {
    filter.phone_no = { $regex: req.query.phone_no, $options: "i" };
  }

  const customers = await Customer.find(filter)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalCustomers = await Customer.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "Customers fetched successfully",
    page,
    limit,
    totalCustomers,
    totalPages: Math.ceil(totalCustomers / limit),
    customers,
  });
});

//    Get customer by ID
//    GET /api/customers/:id
//    Private/Admin or Customer (own profile)
export const getCustomerById = catchAsync(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id).select("-password");

  if (!customer) {
    return next(new AppError("Customer not found", 404));
  }

  // Customers can only view their own profile
  if (req.user.role === "customer" && customer._id.toString() !== req.user.id) {
    return next(new AppError("Not authorized to access this customer", 403));
  }

  res.status(200).json({
    success: true,
    customer,
  });
});

//    Update customer
//    PUT /api/customers/:id
//    Private/Customer (own profile) or Admin
export const updateCustomer = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const customer = await Customer.findById(id);
  if (!customer) {
    return next(new AppError("Customer not found", 404));
  }

  // Customers can only update their own profile
  if (req.user.role === "customer") {
    if (customer._id.toString() !== req.user.id) {
      return next(new AppError("Not authorized to update this customer", 403));
    }
    // Customers cannot update isActive status
    delete req.body.isActive;
  }

  // Don't allow updating password through this route
  if (req.body.password) {
    return next(new AppError("Password cannot be updated through this route", 400));
  }

  // Check if email is being updated and if it already exists
  if (req.body.email && req.body.email !== customer.email) {
    const existingCustomer = await Customer.findOne({ email: req.body.email, _id: { $ne: id } });
    if (existingCustomer) {
      return next(new AppError("Email already registered", 400));
    }
  }

  const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    customer: updatedCustomer,
  });
});

//   Delete customer (Admin only)
//   DELETE /api/customers/:id
//   Private/Admin
export const deleteCustomer = catchAsync(async (req, res, next) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer) {
    return next(new AppError("Customer not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Customer deleted successfully",
  });
});
