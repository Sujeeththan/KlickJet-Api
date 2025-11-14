import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";
import { buildQuery, buildPaginationMeta } from "../utils/queryBuilder.js";

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public (anyone can view reviews)
// @query   search, product_id, order_id, customer_id, rating_min, rating_max, my_reviews, sort, sortOrder, page, limit
export const getAllReviews = catchAsync(async (req, res, next) => {
  // Build query using the query builder utility
  const { filter, sort, pagination } = buildQuery({
    query: req.query,
    searchFields: ["comment"], // Search in review comments
    filterFields: {
      product_id: "objectId",
      order_id: "objectId",
      customer_id: "objectId",
      rating: "numberRange", // Supports rating_min and rating_max
    },
    roleBasedFilters: {
      // If my_reviews is true, filter by customer_id
      customer: req.query.my_reviews === "true" ? { customer_id: req.user?.id } : {},
    },
    user: req.user || null,
  });

  // Handle my_reviews filter for customers
  if (req.user && req.user.role === "customer" && req.query.my_reviews === "true") {
    filter.customer_id = req.user.id;
  }

  // Execute query with pagination
  const totalReviews = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate("customer_id", "name email")
    .populate("product_id", "name")
    .populate("order_id", "status")
    .sort(sort);

  // Build pagination metadata
  const paginationMeta = buildPaginationMeta(
    totalReviews,
    pagination.page,
    pagination.limit
  );

  res.status(200).json({
    success: true,
    message: "Reviews fetched successfully",
    ...paginationMeta,
    reviews,
  });
});

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
export const getReviewById = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate("customer_id", "name email")
    .populate("product_id", "name")
    .populate("order_id", "status");

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.status(200).json({
    success: true,
    review,
  });
});

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private/Customer
export const createReview = catchAsync(async (req, res, next) => {
  const { order_id, product_id, rating, comment } = req.body;

  // Validation - show first error only
  if (!order_id) {
    return next(new AppError("Order ID is required", 400));
  }
  if (!product_id) {
    return next(new AppError("Product ID is required", 400));
  }
  if (!rating) {
    return next(new AppError("Rating is required", 400));
  }
  if (rating < 1 || rating > 5) {
    return next(new AppError("Rating must be between 1 and 5", 400));
  }

  // Check if order exists and belongs to the customer
  const order = await Order.findById(order_id);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (order.customer_id.toString() !== req.user.id) {
    return next(new AppError("Not authorized to create review for this order", 403));
  }

  // Check if product exists and matches the order
  const product = await Product.findById(product_id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (order.product_id.toString() !== product_id) {
    return next(new AppError("Product does not match the order", 400));
  }

  // Check if review already exists for this order
  const existingReview = await Review.findOne({ order_id });
  if (existingReview) {
    return next(new AppError("Review already exists for this order", 400));
  }

  const review = await Review.create({
    customer_id: req.user.id,
    order_id,
    product_id,
    rating,
    comment: comment ? comment.trim() : "",
  });

  const populatedReview = await Review.findById(review._id)
    .populate("customer_id", "name email")
    .populate("product_id", "name")
    .populate("order_id", "status");

  res.status(201).json({
    success: true,
    message: "Review created successfully",
    review: populatedReview,
  });
});

// @desc    Update review by ID
// @route   PUT /api/reviews/:id
// @access  Private/Customer (own reviews) or Admin
export const updateReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // Customers can only update their own reviews
  if (req.user.role === "customer" && review.customer_id.toString() !== req.user.id) {
    return next(new AppError("Not authorized to update this review", 403));
  }

  // Validation
  if (req.body.rating !== undefined && (req.body.rating < 1 || req.body.rating > 5)) {
    return next(new AppError("Rating must be between 1 and 5", 400));
  }

  // Update review
  const updatedReview = await Review.findByIdAndUpdate(
    id,
    { ...req.body, comment: req.body.comment ? req.body.comment.trim() : undefined },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("customer_id", "name email")
    .populate("product_id", "name")
    .populate("order_id", "status");

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    review: updatedReview,
  });
});

// @desc    Delete review by ID
// @route   DELETE /api/reviews/:id
// @access  Private/Customer (own reviews) or Admin
export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // Customers can only delete their own reviews
  if (req.user.role === "customer" && review.customer_id.toString() !== req.user.id) {
    return next(new AppError("Not authorized to delete this review", 403));
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});


