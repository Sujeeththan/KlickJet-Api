import express from "express";
import {
  getAllSeller,
  getSellerById,
  createSeller,
  updateSeller,
  deleteSeller,
} from "../controllers/sellerController.js";
import { protect } from "../middleware/auth.js";
import { adminOnly, adminOrApprovedSeller } from "../middleware/roleMiddleware.js";

const sellerRouter = express.Router();

// Protect all seller routes - only approved sellers and admins can access
sellerRouter.use(protect);

// Seller routes - protected (only approved sellers and admins)
sellerRouter.get("/", adminOnly, getAllSeller); // Only admin can get all sellers
sellerRouter.get("/:id", adminOrApprovedSeller, getSellerById); // Admin or approved seller can get seller by ID
sellerRouter.post("/", adminOnly, createSeller); // Only admin can create sellers via this route
sellerRouter.put("/:id", adminOrApprovedSeller, updateSeller); // Admin or approved seller can update
sellerRouter.delete("/:id", adminOnly, deleteSeller); // Only admin can delete sellers

export default sellerRouter;
