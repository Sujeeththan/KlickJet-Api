import express from "express";

import {
  getAllShop,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
} from "../controllers/shopController.js";

const shopRouter = express.Router();

shopRouter.get("/", getAllShop);
shopRouter.get("/:id", getShopById);
shopRouter.post("/", createShop);
shopRouter.put("/:id", updateShop);
shopRouter.delete("/:id", deleteShop);

export default shopRouter;
