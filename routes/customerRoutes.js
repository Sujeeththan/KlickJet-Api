import express from "express";
import {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/roleMiddleware.js";

const customerRouter = express.Router();

// All customer routes require authentication
customerRouter.get("/", verifyToken, verifyRole(["admin", "customer"]), getAllCustomers);
customerRouter.get("/:id", verifyToken, verifyRole(["admin", "customer"]), getCustomerById);
customerRouter.put("/:id", verifyToken, verifyRole(["admin", "customer"]), updateCustomer);
customerRouter.delete("/:id", verifyToken, verifyRole("admin"), deleteCustomer);

export default customerRouter;
