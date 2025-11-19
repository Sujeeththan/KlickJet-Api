import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin or Customer (own payments)
export const getAllPayments = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // Customers can only see their own payments
  if (req.user.role === "customer") {
    filter.customer_id = req.user.id;
  }

  if (req.query.payment_method) {
    filter.payment_method = req.query.payment_method;
  }

  if (req.query.order_id) {
    filter.order_id = req.query.order_id;
  }

  const payments = await Payment.find(filter)
    .skip(skip)
    .limit(limit)
    .populate("customer_id", "name email")
    .populate("order_id", "total_amount status")
    .sort({ createdAt: -1 });

  const totalPayments = await Payment.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "Payments fetched successfully",
    page,
    limit,
    totalPayments,
    totalPages: Math.ceil(totalPayments / limit),
    payments,
  });
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private/Admin or Customer (own payment)
export const getPaymentById = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate("customer_id", "name email")
    .populate("order_id", "total_amount status");

  if (!payment) {
    return next(new AppError("Payment not found", 404));
  }

  // Customers can only view their own payments
  if (req.user.role === "customer" && payment.customer_id._id.toString() !== req.user.id) {
    return next(new AppError("Not authorized to access this payment", 403));
  }

  res.status(200).json({
    success: true,
    payment,
  });
});

// @desc    Create payment
// @route   POST /api/payments
// @access  Private/Customer
export const createPayment = catchAsync(async (req, res, next) => {
  const { order_id, payment_method } = req.body;

  // Validation - show first error only
  if (!order_id) {
    return next(new AppError("Order ID is required", 400));
  }
  if (!payment_method) {
    return next(new AppError("Payment method is required", 400));
  }

  // Validate payment method
  if (!["cash on delivery", "card"].includes(payment_method)) {
    return next(new AppError("Invalid payment method. Must be one of: cash on delivery, card", 400));
  }

  // Check if order exists and belongs to the customer
  const order = await Order.findById(order_id);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Customers can only create payments for their own orders
  if (order.customer_id.toString() !== req.user.id) {
    return next(new AppError("Not authorized to create payment for this order", 403));
  }

  // Check if payment already exists for this order
  const existingPayment = await Payment.findOne({ order_id });
  if (existingPayment) {
    return next(new AppError("Payment already exists for this order", 400));
  }

  const payment = await Payment.create({
    customer_id: req.user.id,
    order_id,
    payment_method,
  });

  const populatedPayment = await Payment.findById(payment._id)
    .populate("customer_id", "name email")
    .populate("order_id", "total_amount status");

  res.status(201).json({
    success: true,
    message: "Payment created successfully",
    payment: populatedPayment,
  });
});

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private/Admin
export const updatePayment = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const payment = await Payment.findById(id);
  if (!payment) {
    return next(new AppError("Payment not found", 404));
  }

  // Validate payment method if provided
  if (req.body.payment_method && !["cash", "credit_card", "online", "upi"].includes(req.body.payment_method)) {
    return next(new AppError("Invalid payment method. Must be one of: cash, credit_card, online, upi", 400));
  }

  const updatedPayment = await Payment.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("customer_id", "name email")
    .populate("order_id", "total_amount status");

  res.status(200).json({
    success: true,
    message: "Payment updated successfully",
    payment: updatedPayment,
  });
});

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private/Admin
export const deletePayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);

  if (!payment) {
    return next(new AppError("Payment not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Payment deleted successfully",
  });
});

