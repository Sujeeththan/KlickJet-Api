import express from "express";

import {
  getAllPayment,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "../controllers/productController.js";

const PaymentRouter = express.Router();

PaymentRouter.get("/", getAllPayment);
PaymentRouter.get("/:id", getPaymentById);
PaymentRouter.post("/", createPayment);
PaymentRouter.put("/:id", updatePayment);
PaymentRouter.delete("/:id", deletePayment);

export default PaymentRouter;
