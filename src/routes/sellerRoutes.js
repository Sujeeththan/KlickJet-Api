import express from "express";
import {
  getAllSellers,
  getApprovedSellers,
  getSellerById,
  updateSeller,
  deleteSeller,
} from "../controllers/sellerController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const sellerRouter = express.Router();

// All routes require authentication
sellerRouter.get("/public/approved", getApprovedSellers); // Public route must be before /:id
sellerRouter.get("/", verifyToken, verifyRole("admin" ), getAllSellers);
sellerRouter.get("/:id", verifyToken, verifyRole(["admin", "seller"]), getSellerById);
sellerRouter.put("/:id", verifyToken, verifyRole( "seller"), updateSeller);
sellerRouter.delete("/:id", verifyToken, verifyRole("admin", "seller"), deleteSeller);

export default sellerRouter;

