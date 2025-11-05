import express from "express";

import {
  getAllProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/", getAllProduct);
productRouter.get("/:id", getProductById);
productRouter.post("/", createProduct);
productRouter.put("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
