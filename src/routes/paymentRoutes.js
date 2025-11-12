import express from "express";
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const paymentRouter = express.Router();

// All routes require authentication
paymentRouter.get("/", verifyToken, verifyRole(["admin", "customer"]), getAllPayments);
paymentRouter.get("/:id", verifyToken, verifyRole(["admin", "customer"]), getPaymentById);
paymentRouter.post("/", verifyToken, verifyRole("customer"), createPayment);
paymentRouter.put("/:id", verifyToken, verifyRole("admin"), updatePayment);
paymentRouter.delete("/:id", verifyToken, verifyRole("admin"), deletePayment);

export default paymentRouter;

