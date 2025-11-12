import express from "express";
import {
  getPendingSellers,
  approveSeller,
  rejectSeller,
  getPendingDeliverers,
  approveDeliverer,
  rejectDeliverer,
} from "../controllers/adminController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const adminRouter = express.Router();

// All routes require admin authentication
// Seller approval routes
adminRouter.get("/sellers/pending", verifyToken, verifyRole("admin"), getPendingSellers);
adminRouter.put("/sellers/:id/approve", verifyToken, verifyRole("admin"), approveSeller);
adminRouter.put("/sellers/:id/reject", verifyToken, verifyRole("admin"), rejectSeller);

// Deliverer approval routes
adminRouter.get("/deliverers/pending", verifyToken, verifyRole("admin"), getPendingDeliverers);
adminRouter.put("/deliverers/:id/approve", verifyToken, verifyRole("admin"), approveDeliverer);
adminRouter.put("/deliverers/:id/reject", verifyToken, verifyRole("admin"), rejectDeliverer);

export default adminRouter;

