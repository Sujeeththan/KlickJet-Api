import express from "express";
import {
  getAllDeliverers,
  getDelivererById,
  createDeliverer,
  updateDeliverer,
  deleteDeliverer,
} from "../controllers/delivererController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const delivererRouter = express.Router();

// All deliverer routes require admin authentication
delivererRouter.get("/", verifyToken, verifyRole("admin"), getAllDeliverers);
delivererRouter.get("/:id", verifyToken, verifyRole("admin"), getDelivererById);
delivererRouter.post("/", verifyToken, verifyRole("admin"), createDeliverer);
delivererRouter.put("/:id", verifyToken, verifyRole("admin"), updateDeliverer);
delivererRouter.delete("/:id", verifyToken, verifyRole("admin"), deleteDeliverer);

export default delivererRouter;
