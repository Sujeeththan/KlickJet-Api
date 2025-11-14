import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";
import { buildQuery, buildPaginationMeta } from "../utils/queryBuilder.js";

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
// @query   search, status, customer_id, product_id, total_amount_min, total_amount_max, order_date_from, order_date_to, sort, sortOrder, page, limit
export const getAllOrders = catchAsync(async (req, res, next) => {
  // Build base query using the query builder utility
  const { filter, sort, pagination } = buildQuery({
    query: req.query,
    searchFields: [], // Orders don't have direct text fields, but we can search via populated fields
    filterFields: {
      status: "string",
      customer_id: "objectId",
      product_id: "objectId",
      total_amount: "numberRange", // Supports total_amount_min and total_amount_max
      order_date: "dateRange", // Supports order_date_from and order_date_to
      quantity: "numberRange", // Supports quantity_min and quantity_max
    },
    roleBasedFilters: {
      customer: { customer_id: req.user.id }, // Customers only see their own orders
    },
    user: req.user,
  });

  // Sellers can only see orders for their products
  // This requires a special query since we need to get product IDs first
  if (req.user.role === "seller") {
    const sellerProducts = await Product.find({ seller_id: req.user.id }).select("_id");
    const productIds = sellerProducts.map((p) => p._id);
    
    if (productIds.length === 0) {
      // Seller has no products, return empty result
      return res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        ...buildPaginationMeta(0, pagination.page, pagination.limit),
        orders: [],
      });
    }
    
    // If product_id filter is already set, intersect with seller's products
    if (filter.product_id) {
      const requestedProductId = filter.product_id;
      // Check if the requested product belongs to the seller
      if (!productIds.some(id => id.toString() === requestedProductId.toString())) {
        return res.status(200).json({
          success: true,
          message: "Orders fetched successfully",
          ...buildPaginationMeta(0, pagination.page, pagination.limit),
          orders: [],
        });
      }
    } else {
      filter.product_id = { $in: productIds };
    }
  }

  // Execute query with pagination
  const totalOrders = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate("customer_id", "name email phone_no")
    .populate("product_id", "name price")
    .sort(sort);

  // Build pagination metadata
  const paginationMeta = buildPaginationMeta(
    totalOrders,
    pagination.page,
    pagination.limit
  );

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    ...paginationMeta,
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


