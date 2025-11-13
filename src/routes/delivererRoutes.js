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
delivererRouter.get("/", verifyToken, verifyRole(["admin", "seller"]), getAllDeliverers);
delivererRouter.get("/:id", verifyToken, verifyRole(["admin","seller", "deliverer"]), getDelivererById);
delivererRouter.put("/:id", verifyToken, verifyRole( "deliverer"), updateDeliverer);
delivererRouter.delete("/:id", verifyToken, verifyRole("deliverer"), deleteDeliverer);

export default delivererRouter;

