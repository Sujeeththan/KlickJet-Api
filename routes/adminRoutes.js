import express from "express";
import {
  getPendingSellers,
  approveSeller,
  rejectSeller,
  approveCustomer,
  approveDeliverer,
} from "../controllers/adminController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const adminRouter = express.Router();

// All admin routes require authentication and admin role
adminRouter.use(verifyToken);
adminRouter.use(verifyRole("admin"));

// Seller management routes
adminRouter.get("/sellers/pending", getPendingSellers);
adminRouter.put("/sellers/approve/:id", approveSeller);
adminRouter.put("/sellers/reject/:id", rejectSeller);

// Customer management routes
adminRouter.put("/customers/approve/:id", approveCustomer);

// Deliverer management routes
adminRouter.put("/deliverers/approve/:id", approveDeliverer);

export default adminRouter;
