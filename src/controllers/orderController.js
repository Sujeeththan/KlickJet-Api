import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getAllOrders = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // Customers can only see their own orders
  if (req.user.role === "customer") {
    filter.customer_id = req.user.id;
  }

  // Sellers can only see orders for their products
  if (req.user.role === "seller") {
    const sellerProducts = await Product.find({ seller_id: req.user.id }).select("_id");
    const productIds = sellerProducts.map((p) => p._id);
    filter.product_id = { $in: productIds };
  }

  // Admins can see all orders
  // No filter needed for admins

  const totalOrders = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .skip(skip)
    .limit(limit)
    .populate("customer_id", "name email phone_no")
    .populate("product_id", "name price")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    page,
    limit,
    message: "Orders fetched successfully",
    totalOrders,
    totalPages: Math.ceil(totalOrders / limit),
    orders,
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("customer_id", "name email phone_no address")
    .populate({
      path: "product_id",
      populate: {
        path: "seller_id",
        select: "name shopName",
      },
    });

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Check authorization
  if (req.user.role === "customer" && order.customer_id._id.toString() !== req.user.id) {
    return next(new AppError("Not authorized to access this order", 403));
  }

  if (req.user.role === "seller") {
    const product = await Product.findById(order.product_id);
    if (!product || product.seller_id?.toString() !== req.user.id) {
      return next(new AppError("Not authorized to access this order", 403));
    }
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
export const createOrder = catchAsync(async (req, res, next) => {
  const { product_id, quantity } = req.body;

  // Validation - show first error only
  if (!product_id) {
    return next(new AppError("Product ID is required", 400));
  }
  if (!quantity) {
    return next(new AppError("Quantity is required", 400));
  }
  if (quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  // Get product
  const product = await Product.findById(product_id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (!product.instock) {
    return next(new AppError("Product is out of stock", 400));
  }

  // Calculate total amount
  const discountAmount = (product.price * product.discount) / 100;
  const priceAfterDiscount = product.price - discountAmount;
  const total_amount = priceAfterDiscount * quantity;

  // Create order
  const order = await Order.create({
    customer_id: req.user.id,
    product_id,
    quantity,
    total_amount,
    status: "pending",
  });

  const populatedOrder = await Order.findById(order._id)
    .populate("customer_id", "name email")
    .populate("product_id", "name price");

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    order: populatedOrder,
  });
});

// @desc    Update order by ID
// @route   PUT /api/orders/:id
// @access  Private/Seller or Admin
export const updateOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Check if seller owns the product in this order
  if (req.user.role === "seller") {
    const product = await Product.findById(order.product_id);
    if (!product || product.seller_id?.toString() !== req.user.id) {
      return next(new AppError("Not authorized to update this order", 403));
    }
  }

  // Update order
  const updatedOrder = await Order.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("customer_id", "name email")
    .populate("product_id", "name price");

  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    order: updatedOrder,
  });
});

// @desc    Delete order by ID
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});

