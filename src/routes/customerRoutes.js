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

// All routes require authentication
customerRouter.get("/", verifyToken, verifyRole(["seller","admin"]), getAllCustomers);
customerRouter.get(
  "/:id",
  verifyToken,
  verifyRole(["seller","admin", "customer"]),
  getCustomerById
);
customerRouter.put(
  "/:id",
  verifyToken,
  verifyRole("customer"),
  updateCustomer
);
customerRouter.delete("/:id", verifyToken, verifyRole("customer"), deleteCustomer);

export default customerRouter;
