import express from "express";
import {
  authenticateAdmin,
  authorizeRoleAdmin,
  authenticateSubAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";
import {
  getAllSubAdmins,
  getSubAdminById,
  deleteSubAdmin,
  addSubAdmin,
  subAdminLogin,
  subAdminLogout,
  updateSubAdmin,
} from "../controllers/subadminController.js";
import { upload } from "../middlewares/uploadFile.middleware.js";
import { updateBranchById } from "../controllers/branchController.js";

const subadminRouter = express.Router();

//!This is done
subadminRouter.post(
  "/addSubAdmin",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  upload.single("image"),
  addSubAdmin
);

//!This is done
subadminRouter.get(
  "/get-all-subadmins",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  getAllSubAdmins
);

//!This is done
subadminRouter.get(
  "/get/:subAdminId",
  authenticateAdmin,
  authorizeRoleAdmin("Admin"),
  getSubAdminById
);

//!This is done
subadminRouter.delete(
  "/:subAdminId",
  authenticateAdmin,
  authorizeRoleAdmin("Admin"),
  deleteSubAdmin
);

//!This is done
subadminRouter.post("/login", subAdminLogin);

subadminRouter.post(
  "/logout",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  subAdminLogout
);

subadminRouter.patch(
  "/update/:subAdminId",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  upload.single("image"),
  updateSubAdmin
);

export default subadminRouter;
