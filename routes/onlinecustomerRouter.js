import express from "express"
import {
    sendSms,
    verifyOtp,
} from "../controllers/onlineController.js";
import { authenticateAdmin, authorizeRoleAdmin } from "../middleware/auth.js";

const onlineCustomerRouter = express.Router();
/api/v1/online-customer/send-sms
onlineCustomerRouter.post("/send-sms", sendSms);
onlineCustomerRouter.post("/verify-otp", verifyOtp);

export default onlineCustomerRouter;