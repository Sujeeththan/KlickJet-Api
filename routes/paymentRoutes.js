import express from "express";

import {
  getAllPayment,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.get("/", getAllPayment);
paymentRouter.get("/:id", getPaymentById);
paymentRouter.post("/", createPayment);
paymentRouter.put("/:id", updatePayment);
paymentRouter.delete("/:id", deletePayment);

export default paymentRouter;
