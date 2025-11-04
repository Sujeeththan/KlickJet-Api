import express from "express";

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.get("/", getAllUsers);
authRouter.get("/:id", getUserById);
authRouter.post("/", createUser);
authRouter.put("/:id", updateUser);
authRouter.delete("/:id", deleteUser);

export default authRouter;
