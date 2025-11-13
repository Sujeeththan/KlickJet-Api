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
deliveryRouter.get("/", verifyToken, verifyRole(["admin", "seller", "deliverer"]), getAllDeliveries);
deliveryRouter.get("/:id", verifyToken, verifyRole(["seller", "customer", "deliverer"]), getDeliveryById);
deliveryRouter.post("/", verifyToken, verifyRole(["seller", "deliverer"]), createDelivery);
deliveryRouter.put("/:id", verifyToken, verifyRole( "deliverer"), updateDelivery);
deliveryRouter.delete("/:id", verifyToken, verifyRole(["seller", "deliverer"]), deleteDelivery);

export default deliveryRouter;

