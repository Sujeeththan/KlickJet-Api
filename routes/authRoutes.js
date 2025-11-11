import express from "express";
import {
  register,
  login,
  approveSeller,
  rejectSeller,
  getPendingSellers,
  getMe,
  logout,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const authRouter = express.Router();

// Public routes - Unified authentication
authRouter.post("/register", register);
authRouter.post("/login", login);

// Protected routes
authRouter.get("/me", verifyToken, getMe);
authRouter.post("/logout", verifyToken, logout);

// Admin only routes
authRouter.get("/sellers/pending", verifyToken, verifyRole("admin"), getPendingSellers);
authRouter.put("/seller/approve/:id", verifyToken, verifyRole("admin"), approveSeller);
authRouter.put("/seller/reject/:id", verifyToken, verifyRole("admin"), rejectSeller);

export default authRouter;
