import express from "express";

import {
  getAllDelivery,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  deleteDelivery,
} from "../controllers/delivery.js";

const deliveryRouter = express.Router();

deliveryRouter.get("/", getAllDelivery);
deliveryRouter.get("/:id", getDeliveryById);
deliveryRouter.post("/", createDelivery);
deliveryRouter.put("/:id", updateDelivery);
deliveryRouter.delete("/:id", deleteDelivery);

export default deliveryRouter;
