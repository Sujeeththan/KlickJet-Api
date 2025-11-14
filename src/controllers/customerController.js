import Customer from "../models/Customer.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";
import { buildQuery, buildPaginationMeta } from "../utils/queryBuilder.js";

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin or Customer (own profile)
// @query   search, name, email, phone_no, isActive, sort, sortOrder, page, limit
export const getAllCustomers = catchAsync(async (req, res, next) => {
  // Build query using the query builder utility
  const { filter, sort, pagination } = buildQuery({
    query: req.query,
    searchFields: ["name", "email", "phone_no", "address"], // Search across multiple fields
    filterFields: {
      name: "string",
      email: "string",
      phone_no: "string",
      isActive: "boolean",
    },
    roleBasedFilters: {
      customer: { _id: req.user.id }, // Customers only see their own profile
    },
    user: req.user,
  });

  // Execute query with pagination
  const totalCustomers = await Customer.countDocuments(filter);
  const customers = await Customer.find(filter)
    .select("-password")
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort(sort);

  // Build pagination metadata
  const paginationMeta = buildPaginationMeta(
    totalCustomers,
    pagination.page,
    pagination.limit
  );

  res.status(200).json({
    success: true,
    message: "Customers fetched successfully",
    ...paginationMeta,
    customers,
  });
});

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private/Admin or Customer (own profile)
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

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private/Customer (own profile) or Admin
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
    return next(
      new AppError("Password cannot be updated through this route", 400)
    );
  }

  // Check if email is being updated and if it already exists
  if (req.body.email && req.body.email !== customer.email) {
    const existingCustomer = await Customer.findOne({
      email: req.body.email.toLowerCase().trim(),
      _id: { $ne: id },
    });
    if (existingCustomer) {
      return next(new AppError("Email already registered", 400));
    }
  }

  const updatedCustomer = await Customer.findByIdAndUpdate(
    id,
    {
      ...req.body,
      email: req.body.email ? req.body.email.toLowerCase().trim() : undefined,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    customer: updatedCustomer,
  });
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
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
