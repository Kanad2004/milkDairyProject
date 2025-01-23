import express from "express"
import { authenticateUser, authorizeRoles } from "../middleware/auth.js";
import { getAllSubAdmins,getSubAdminById,deleteSubAdmin,addSubAdmin , subAdminLogin , subAdminLogout} from "../controllers/subadminController.js"

const subadminRouter = express.Router();

subadminRouter.post("/addSubAdmin", addSubAdmin);
subadminRouter.get("/get-all-subadmins", authenticateUser , authorizeRoles("Admin") , getAllSubAdmins);
subadminRouter.get("/:subAdminId", authenticateUser , authorizeRoles("Admin"),getSubAdminById);
subadminRouter.delete("/:subAdminId", authenticateUser , authorizeRoles("Admin"),deleteSubAdmin);
