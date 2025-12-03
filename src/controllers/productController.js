import Product from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";
import { buildQuery, buildPaginationMeta } from "../utils/queryBuilder.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Public (Customers can view, sellers can view their own)
// @query   search, instock, price_min, price_max, discount_min, discount_max, seller_id, sort, sortOrder, page, limit
export const getAllProducts = catchAsync(async (req, res, next) => {
  // Build query using the query builder utility
  const { filter, sort, pagination } = buildQuery({
    query: req.query,
    searchFields: ["name", "description"], // Search across name and description
    filterFields: {
      instock: "boolean",
      price: "numberRange", // Supports price_min and price_max
      discount: "numberRange", // Supports discount_min and discount_max
      seller_id: "objectId",
    },
    roleBasedFilters: {
      seller: { seller_id: req.user?.id }, // Sellers only see their own products
    },
    user: req.user || null,
  });

  // Execute query with pagination
  const totalProducts = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .populate("seller_id", "name shopName")
    .sort(sort);

  // Build pagination metadata
  const paginationMeta = buildPaginationMeta(
    totalProducts,
    pagination.page,
    pagination.limit
  );

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    ...paginationMeta,
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
  const { name, price, instock, discount, description, images } = req.body;

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
    images: images || [],
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
// Check seller permission
if (req.user.role === "seller") {
    // If product has no seller_id or mismatch → deny access
    if (!product.seller_id || product.seller_id.toString() !== req.user.id.toString()) {
        return next(new AppError("Not authorized to update this product", 403));
    }
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
    { 
      ...req.body, 
      name: req.body.name ? req.body.name.trim() : undefined, 
      description: req.body.description ? req.body.description.trim() : undefined,
      images: req.body.images || undefined
    },
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


