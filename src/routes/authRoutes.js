import express from "express";
import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const authRouter = express.Router();

// Public routes
authRouter.post("/register", register);
authRouter.post("/login", login);

// Protected routes
authRouter.get("/me", verifyToken, getMe);
authRouter.post("/logout", verifyToken, logout);

export default authRouter;

