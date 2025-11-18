import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { verifyToken, optionalAuth } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const productRouter = express.Router();

// Public routes - anyone can view products
productRouter.get("/", optionalAuth, getAllProducts);
productRouter.get("/:id", optionalAuth, getProductById);

// Protected routes - sellers can manage their products
productRouter.post("/", verifyToken, verifyRole("seller"), createProduct);
productRouter.put("/:id", verifyToken, verifyRole(["seller", "admin"]), updateProduct);
productRouter.delete("/:id", verifyToken, verifyRole("seller"), deleteProduct);

export default productRouter;
