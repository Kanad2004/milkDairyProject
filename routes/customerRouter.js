import express from "express"
import { addCustomer } from "../controllers/customerController.js";
const customerRouter = express.Router();
import { authenticateUser, authorizeRoles } from "../middleware/auth.js";
customerRouter.post("/addCustomer", addCustomer);

export default customerRouter;
