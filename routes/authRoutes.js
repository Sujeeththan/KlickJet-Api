import express from "express";
import {
  registerCustomer,
  loginCustomer,
  registerSeller,
  loginSeller,
  registerAdmin,
  loginAdmin,
  approveSeller,
  rejectSeller,
  getPendingSellers,
  getMe,
  logout,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const authRouter = express.Router();

// Public routes
authRouter.post("/register/customer", registerCustomer);
authRouter.post("/login/customer", loginCustomer);
authRouter.post("/register/seller", registerSeller);
authRouter.post("/login/seller", loginSeller);
authRouter.post("/register/admin", registerAdmin);
authRouter.post("/login/admin", loginAdmin);

// Protected routes
authRouter.get("/me", verifyToken, getMe);
authRouter.post("/logout", verifyToken, logout);

// Admin only routes
authRouter.get("/sellers/pending", verifyToken, verifyRole("admin"), getPendingSellers);
authRouter.put("/seller/approve/:id", verifyToken, verifyRole("admin"), approveSeller);
authRouter.put("/seller/reject/:id", verifyToken, verifyRole("admin"), rejectSeller);

export default authRouter;
