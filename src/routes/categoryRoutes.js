import express from "express";
import { getAllCategories, createCategory } from "../controllers/categoryController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getAllCategories)
  .post(protect, restrictTo("admin"), createCategory);

export default router;
