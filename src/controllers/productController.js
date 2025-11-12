import Product from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Public (Customers can view, sellers can view their own)
export const getAllProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // If seller is viewing (and authenticated), only show their products
  if (req.user && req.user.role === "seller") {
    filter.seller_id = req.user.id;
  }

  // Search by product name
  if (req.query.name) {
    filter.name = { $regex: req.query.name, $options: "i" };
  }

  // Filter by stock status
  if (req.query.instock !== undefined) {
    filter.instock = req.query.instock === "true";
  }

  const totalProducts = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .skip(skip)
    .limit(limit)
    .populate("seller_id", "name shopName")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    page,
    limit,
    message: "Products fetched successfully",
    totalProducts,
    totalPages: Math.ceil(totalProducts / limit),
    products,
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate(
    "seller_id",
    "name shopName"
  );

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Seller
export const createProduct = catchAsync(async (req, res, next) => {
  const { name, price, instock, discount, description } = req.body;

  // Validation - show first error only
  if (!name) {
    return next(new AppError("Product name is required", 400));
  }
  if (price === undefined) {
    return next(new AppError("Product price is required", 400));
  }
  if (price < 0) {
    return next(new AppError("Price must be greater than or equal to 0", 400));
  }
  if (discount !== undefined && (discount < 0 || discount > 100)) {
    return next(new AppError("Discount must be between 0 and 100", 400));
  }

  // Set seller_id to the logged-in seller
  const productData = {
    name: name.trim(),
    price,
    instock: instock !== undefined ? instock : true,
    discount: discount || 0,
    description: description ? description.trim() : "",
    seller_id: req.user.id,
  };

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

// @desc    Update product by ID
// @route   PUT /api/products/:id
// @access  Private/Seller (own products only) or Admin
export const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Check if seller owns this product (or admin)
  if (req.user.role === "seller" && product.seller_id?.toString() !== req.user.id) {
    return next(new AppError("Not authorized to update this product", 403));
  }

  // Validation
  if (req.body.price !== undefined && req.body.price < 0) {
    return next(new AppError("Price must be greater than or equal to 0", 400));
  }
  if (req.body.discount !== undefined && (req.body.discount < 0 || req.body.discount > 100)) {
    return next(new AppError("Discount must be between 0 and 100", 400));
  }

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { ...req.body, name: req.body.name ? req.body.name.trim() : undefined, description: req.body.description ? req.body.description.trim() : undefined },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product: updatedProduct,
  });
});

// @desc    Delete product by ID
// @route   DELETE /api/products/:id
// @access  Private/Seller (own products only) or Admin
export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Check if seller owns this product (or admin)
  if (req.user.role === "seller" && product.seller_id?.toString() !== req.user.id) {
    return next(new AppError("Not authorized to delete this product", 403));
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

