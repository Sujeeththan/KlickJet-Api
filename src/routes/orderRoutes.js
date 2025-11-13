import express from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const orderRouter = express.Router();

// All routes require authentication
orderRouter.get("/", verifyToken, verifyRole("seller"), getAllOrders);
orderRouter.get("/:id", verifyToken, verifyRole( "seller"), getOrderById);
orderRouter.post("/", verifyToken, verifyRole("customer"), createOrder);
orderRouter.put("/:id", verifyToken, verifyRole("seller"), updateOrder);
orderRouter.delete("/:id", verifyToken, verifyRole("seller"), deleteOrder);

export default orderRouter;

