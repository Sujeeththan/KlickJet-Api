import express from "express";
import {
  getAllDeliverers,
  getDelivererById,
  updateDeliverer,
  deleteDeliverer,
} from "../controllers/delivererController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const delivererRouter = express.Router();

// All routes require authentication
delivererRouter.get("/", verifyToken, verifyRole(["admin", "deliverer"]), getAllDeliverers);
delivererRouter.get("/:id", verifyToken, verifyRole(["admin", "deliverer"]), getDelivererById);
delivererRouter.put("/:id", verifyToken, verifyRole(["admin", "deliverer"]), updateDeliverer);
delivererRouter.delete("/:id", verifyToken, verifyRole("admin"), deleteDeliverer);

export default delivererRouter;

