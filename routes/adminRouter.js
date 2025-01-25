import express from "express";
import {
  login,
  logoutAdmin,
  addAdmin,
} from "../controllers/adminController.js";
import { authenticateAdmin, authorizeRoleAdmin } from "../middlewares/auth.js";

const adminRouter = express.Router();

//!This is done
adminRouter.post("/addAdmin", addAdmin);

//!This is done
adminRouter.post("/login", login);

//!This is done
adminRouter.post(
  "/logout",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  logoutAdmin
);

export default adminRouter;
