import express from "express"

import{
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from "../controllers/customerController.js"

const  customerRouter = express.Router();

 customerRouter.get("/", getAllCustomers);
 customerRouter.get("/:id", getCustomerById);
 customerRouter.post("/", createCustomer);
 customerRouter.put("/:id", updateCustomer);
 customerRouter.delete("/:id", deleteCustomer);

export default  customerRouter;
