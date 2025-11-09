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
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const authRouter = express.Router();

// Public routes
authRouter.post("/register/customer", registerCustomer);
authRouter.post("/login/customer", loginCustomer);
authRouter.post("/register/seller", registerSeller);
authRouter.post("/login/seller", loginSeller);
authRouter.post("/register/admin", registerAdmin);
authRouter.post("/login/admin", loginAdmin);

// Protected routes
authRouter.get("/me", protect, getMe);

// Admin only routes
authRouter.get("/sellers/pending", protect, adminOnly, getPendingSellers);
authRouter.put("/seller/approve/:id", protect, adminOnly, approveSeller);
authRouter.put("/seller/reject/:id", protect, adminOnly, rejectSeller);

export default authRouter;
