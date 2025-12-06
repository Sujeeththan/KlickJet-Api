import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Get cart and clear cart
router.route("/").get(getCart).delete(clearCart);

// Add to cart
router.post("/", addToCart);

// Update and remove cart item
router.route("/:itemId").put(updateCartItem).delete(removeFromCart);

export default router;
