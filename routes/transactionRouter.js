import express from "express";
import { generateReport, generateCombinedReport } from "../controllers/transactionController.js";
import { authenticateSubAdmin, authorizeRoleSubAdmin } from "../middlewares/auth.js";
const router = express.Router();

//subadmin 
router.get("/customer-reports/:type",  authenticateSubAdmin,authorizeRoleSubAdmin(["subAdmin"]), generateReport);



//admin 
router.get("/customer-reports/:type",  authenticateSubAdmin,authorizeRoleSubAdmin(["Admin"]), generateReport);
router.get("/customer-reports/all", authenticateSubAdmin,authorizeRoleSubAdmin(["Admin"]),generateCombinedReport);





export default router;
