import Product from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";
import { catchAsync } from "../middleware/errorHandler.js";

//   Get all products
//   GET /api/products
//   Public (Customers can view, sellers can view their own)
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

//   Get product by ID
//   GET /api/products/:id
//   Public
export const getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate(
    "seller_id",
    "name shopName"
  );

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // If seller is viewing (and authenticated), ensure it's their product
  if (req.user && req.user.role === "seller") {
    // If seller is trying to access a product, check if it's theirs
    // But allow public access to view products
    // This check is mainly for update/delete operations which are already protected
  }

  res.status(200).json({
    success: true,
    product,
  });
});

//   Create new product
//   POST /api/products
//   Private/Seller
export const createProduct = catchAsync(async (req, res, next) => {
  const { name, price, instock, discount, description } = req.body;

  // Validation
  if (!name || price === undefined) {
    return next(new AppError("Please provide name and price", 400));
  }

  if (price < 0) {
    return next(new AppError("Price must be greater than or equal to 0", 400));
  }

  // Set seller_id to the logged-in seller
  const productData = {
    name,
    price,
    instock: instock !== undefined ? instock : true,
    discount: discount || 0,
    description: description || "",
    seller_id: req.user.id,
  };

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

//   Update product by ID
//   PUT /api/products/:id
//   Private/Seller (own products only)
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

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product: updatedProduct,
  });
});

//   Delete product by ID
//   DELETE /api/products/:id
//   Private/Seller (own products only) or Admin
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
