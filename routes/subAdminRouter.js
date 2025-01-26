// import express from "express";
// import { getBranchData } from "../controllers/subAdminController.js";
// import { authenticateUser, authorizeRoles } from "../middleware/auth.js";

// const router = express.Router();

// router.use(authenticateUser);

// // SubAdmin-only routes
// router.get("/branch", authorizeRoles("SubAdmin"), getBranchData);

// export default router;

import express from "express";
import {
  subAdminLogin,
  subAdminLogout,
  getAllSubAdmins,
  getSubAdminById,
  // getBranchData, // Added SubAdmin-specific route
} from "../controllers/subAdminController.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.js";

const subAdminRouter = express.Router();

// Public routes
subAdminRouter.post("/api/v1/subadmin/login", subAdminLogin);
subAdminRouter.post("/api/v1/subadmin/logout", authenticateUser, subAdminLogout);

// SubAdmin-specific routes
// subAdminRouter.get(
//   "/api/v1/subadmin/branch",
//   authenticateUser,
//   authorizeRoles("SubAdmin"),
//   getBranchData
// );

// Admin-only routes
subAdminRouter.get(
  "/subadmins",
  authenticateUser,
  authorizeRoles(["Admin"]),
  getAllSubAdmins
);
subAdminRouter.get(
  "/subadmin/:subAdminId",
  authenticateUser,
  authorizeRoles("Admin"),
  getSubAdminById
);

export default subAdminRouter;
