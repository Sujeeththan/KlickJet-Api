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
    searchFields: [], // Orders don't have direct text fields
    filterFields: {
      status: "string",
      customer_id: "objectId",
      total_amount: "numberRange",
      order_date: "dateRange",
    },
    roleBasedFilters: {
      customer: { customer_id: req.user.id }, // Customers only see their own orders
    },
    user: req.user,
  });

  // Sellers can only see orders that contain their products
  if (req.user.role === "seller") {
    const sellerProducts = await Product.find({ seller_id: req.user.id }).select("_id");
    const productIds = sellerProducts.map((p) => p._id);
    
    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        ...buildPaginationMeta(0, pagination.page, pagination.limit),
        orders: [],
      });
    }

    // Filter orders where 'items.product' is in the seller's product list
    filter['items.product'] = { $in: productIds };
  }

  // Execute query with pagination
  const totalOrders = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate("customer_id", "name email phone_no")
    .populate("items.product", "name price seller_id") // Populate product details in items
    .sort(sort);

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    ...buildPaginationMeta(
      totalOrders,
      pagination.page,
      pagination.limit
    ),
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
      path: "items.product",
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
    // Check if any product in the order belongs to this seller
    const hasSellerProduct = order.items.some(item => 
      item.product && item.product.seller_id && item.product.seller_id._id.toString() === req.user.id
    );

    if (!hasSellerProduct) {
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
  const { items, shippingAddress, paymentMethod, contactInfo } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError("Order must contain at least one item", 400));
  }

  if (!shippingAddress) {
    return next(new AppError("Shipping address is required", 400));
  }

  let total_amount = 0;
  const orderItems = [];

  // Validate all products and calculate total
  for (const item of items) {
    const { product: productId, quantity } = item;
    
    // Validate item structure
    if (!productId || !quantity || quantity < 1) {
      return next(new AppError("Invalid item in order", 400));
    }

    const productDoc = await Product.findById(productId);
    if (!productDoc) {
      return next(new AppError(`Product not found: ${productId}`, 404));
    }

    if (!productDoc.instock) {
      return next(new AppError(`Product is out of stock: ${productDoc.name}`, 400));
    }

    // Calculate price for this item
    const discountAmount = (productDoc.price * productDoc.discount) / 100;
    const priceAfterDiscount = productDoc.price - discountAmount;
    
    // Add to order items
    orderItems.push({
      product: productId,
      quantity,
      price: priceAfterDiscount
    });

    total_amount += priceAfterDiscount * quantity;
  }
  
  // Create order
  const order = await Order.create({
    customer_id: req.user.id,
    items: orderItems,
    total_amount,
    shippingAddress,
    paymentMethod: paymentMethod || 'cod',
    contactInfo,
    status: "pending",
  });

  const populatedOrder = await Order.findById(order._id)
    .populate("customer_id", "name email")
    .populate("items.product", "name price");

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

  const order = await Order.findById(id).populate('items.product');
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Check if seller owns user authorized to update this order
  if (req.user.role === "seller") {
    // Check if any product in the order belongs to this seller
    // Note: In a real multi-vendor system, a seller should probably only update the status of THEIR items
    // But for now, we'll allow if they are part of the order.
    const hasSellerProduct = order.items.some(item => 
      item.product && item.product.seller_id && item.product.seller_id.toString() === req.user.id
    );

    if (!hasSellerProduct) {
      return next(new AppError("Not authorized to update this order", 403));
    }
  }

  // Update order
  const updatedOrder = await Order.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("customer_id", "name email")
    .populate("items.product", "name price");

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


