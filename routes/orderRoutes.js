import express from "express";
import {
  getAllOrder,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";
import { adminOrApprovedSeller, adminOnly } from "../middleware/roleMiddleware.js";

const orderRouter = express.Router();

// Protect all order routes - sellers handle orders, so they need to be approved
// Admin has full access, approved sellers can access order routes
orderRouter.use(protect);

// Order routes - protected (admin or approved seller)
// Note: You may want to allow customers to create/view their own orders
// Adjust these routes based on your business logic
orderRouter.get("/", adminOrApprovedSeller, getAllOrder);
orderRouter.get("/:id", adminOrApprovedSeller, getOrderById);
orderRouter.post("/", adminOrApprovedSeller, createOrder);
orderRouter.put("/:id", adminOrApprovedSeller, updateOrder);
orderRouter.delete("/:id", adminOnly, deleteOrder); // Only admin can delete orders

export default orderRouter;
