// import express from "express"
// const { login, logoutAdmin } = require("../controllers/adminController");
// const adminRouter = express.Router();
// // !Login
// adminRouter.post("/api/v1/admin/login", login);
// // !logout
// adminRouter.post("/api/v1/admin/logout", logoutAdmin);
// export default adminRouter;

import express from "express";
import {
  login,
  logoutAdmin,
  getAllSubAdmins,
  getSubAdminById,
  deleteSubAdmin,
  createBranch,
  getBranches,
} from "../controllers/adminController.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.js";

const adminRouter = express.Router();
import { addAdmin, addSubAdmin } from "../controllers/adminController.js"; // Adjust path to controller
// const router = express.Router();

// Route for adding admin
adminRouter.post("/addAdmin", addAdmin);

// Route for adding subadmin
adminRouter.post("/addSubAdmin", addSubAdmin);

// Public routes
adminRouter.post("/login", login);

adminRouter.use(authenticateUser);
adminRouter.post("/logout", authorizeRoles("Admin"),logoutAdmin);

// Protected routes

// Admin-only routes
adminRouter.get(
  "/admin/subadmins",
  authorizeRoles("Admin"),
  getAllSubAdmins
);
adminRouter.get(
  "/admin/subadmin/:subAdminId",
  authorizeRoles("Admin"),
  getSubAdminById
);
adminRouter.delete(
  "/admin/subadmin/:subAdminId",
  authorizeRoles("Admin"),
  deleteSubAdmin
);
adminRouter.post(
  "/admin/branch",
  authorizeRoles("Admin"),
  createBranch
);
adminRouter.get(
  "/admin/branches",
  authorizeRoles("Admin"),
  getBranches
);

export default adminRouter;
