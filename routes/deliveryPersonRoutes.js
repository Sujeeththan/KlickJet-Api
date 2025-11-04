import express from "express";

import {
  getAllDeliveryPerson,
  getDeliveryPersonById,
  createDeliveryPerson,
  updateDeliveryPerson,
  deleteDeliveryPerson,
} from "../controllers/deliveryPersonController.js";

const deliveryPersonRouter = express.Router();

deliveryPersonRouter.get("/", getAllDeliveryPerson);
deliveryPersonRouter.get("/:id", getDeliveryPersonById);
deliveryPersonRouter.post("/", createDeliveryPerson);
deliveryPersonRouter.put("/:id", updateDeliveryPerson);
deliveryPersonRouter.delete("/:id", deleteDeliveryPerson);

export default deliveryPersonRouter;
