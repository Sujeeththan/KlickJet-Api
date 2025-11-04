import express from "express";

import {
  getAllOrder,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.get("/", getAllOrder);
orderRouter.get("/:id", getOrderById);
orderRouter.post("/", createOrder);
orderRouter.put("/:id", updateOrder);
orderRouter.delete("/:id", deleteOrder);

export default orderRouter;
