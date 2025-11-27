import express from "express";
import {
  getPendingSellers,
  approveSeller,
  rejectSeller,
  deleteSeller,
  getAllSellers,
  getPendingDeliverers,
  approveDeliverer,
  rejectDeliverer,
  deleteDeliverer,
  getAllDeliverers,
  getAllUsers,
} from "../controllers/adminController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const adminRouter = express.Router();

// All routes require admin authentication
// Get all users (unified view)
adminRouter.get("/users", verifyToken, verifyRole("admin"), getAllUsers);

// Seller approval routes
adminRouter.get("/sellers/pending", verifyToken, verifyRole("admin"), getPendingSellers);
adminRouter.get("/sellers", verifyToken, verifyRole("admin"), getAllSellers);
adminRouter.put("/sellers/:id/approve", verifyToken, verifyRole("admin"), approveSeller);
adminRouter.put("/sellers/:id/reject", verifyToken, verifyRole("admin"), rejectSeller);
adminRouter.delete("/sellers/:id", verifyToken, verifyRole("admin"), deleteSeller);

// Deliverer approval routes
adminRouter.get("/deliverers/pending", verifyToken, verifyRole("admin"), getPendingDeliverers);
adminRouter.get("/deliverers", verifyToken, verifyRole("admin"), getAllDeliverers);
adminRouter.put("/deliverers/:id/approve", verifyToken, verifyRole("admin"), approveDeliverer);
adminRouter.put("/deliverers/:id/reject", verifyToken, verifyRole("admin"), rejectDeliverer);
adminRouter.delete("/deliverers/:id", verifyToken, verifyRole("admin"), deleteDeliverer);

export default adminRouter;


