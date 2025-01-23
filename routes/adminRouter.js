import express from "express"
import {
  login,
  logoutAdmin,
  addAdmin
} from "../controllers/adminController.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.js";

const adminRouter = express.Router();

adminRouter.post("/addAdmin", addAdmin);
adminRouter.post("/login", login);
adminRouter.post("/logout", authenticateUser, authorizeRoles['Admin'], logoutAdmin);

export default adminRouter;