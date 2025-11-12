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

// All routes require authentication
deliveryRouter.get("/", verifyToken, verifyRole(["admin", "seller", "customer", "deliverer"]), getAllDeliveries);
deliveryRouter.get("/:id", verifyToken, verifyRole(["admin", "seller", "customer", "deliverer"]), getDeliveryById);
deliveryRouter.post("/", verifyToken, verifyRole("admin"), createDelivery);
deliveryRouter.put("/:id", verifyToken, verifyRole(["admin", "deliverer"]), updateDelivery);
deliveryRouter.delete("/:id", verifyToken, verifyRole("admin"), deleteDelivery);

export default deliveryRouter;

