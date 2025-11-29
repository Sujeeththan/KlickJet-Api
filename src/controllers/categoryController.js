import Category from "../models/Category.js";
import { catchAsync } from "../middleware/errorHandler.js";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    categories,
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = catchAsync(async (req, res, next) => {
  const { name, description, image } = req.body;

  const category = await Category.create({
    name,
    description,
    image,
  });

  res.status(201).json({
    success: true,
    category,
  });
});
