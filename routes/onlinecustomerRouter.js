import express from "express"
import {
    sendOtp,
    verifyOtp,
} from "../controllers/onlineController.js";
// import { authenticateAdmin, authorizeRoleAdmin } from "../middleware/auth.js";

const onlineCustomerRouter = express.Router();

onlineCustomerRouter.post("/send-sms", sendOtp);
onlineCustomerRouter.post("/verify-otp", verifyOtp);

export default onlineCustomerRouter;