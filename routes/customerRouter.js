import express from "express"
import { addCustomer } from "../controllers/customerController.js";
const customerRouter = express.Router();

customerRouter.post("/api/v1/customer/addCustomer", addCustomer);

export default customerRouter;
