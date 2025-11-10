import express from "express";
import {
  getAllDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  deleteDelivery,
} from "../controllers/deliveryController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const deliveryRouter = express.Router();

// All delivery routes require authentication
deliveryRouter.get("/", verifyToken, verifyRole(["admin", "seller", "customer"]), getAllDeliveries);
deliveryRouter.get("/:id", verifyToken, verifyRole(["admin", "seller", "customer"]), getDeliveryById);
deliveryRouter.post("/", verifyToken, verifyRole("admin"), createDelivery);
// Delivery users can update delivery status (for now, any authenticated user can update)
deliveryRouter.put("/:id", verifyToken, verifyRole(["admin", "seller", "customer"]), updateDelivery);
deliveryRouter.delete("/:id", verifyToken, verifyRole("admin"), deleteDelivery);

export default deliveryRouter;
