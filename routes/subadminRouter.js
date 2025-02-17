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

const subAdminRouter = express.Router();

//!This is done
subAdminRouter.post(
  "/addSubAdmin",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  upload.single("image"),
  addSubAdmin
);

//!This is done
subAdminRouter.get(
  "/get-all-subadmins",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  getAllSubAdmins
);

//!This is done
subAdminRouter.get(
  "/get/:subAdminId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin("subAdmin"),
  getSubAdminById
);

//!This is done
subAdminRouter.delete(
  "/delete/:subAdminId",
  authenticateAdmin,
  authorizeRoleAdmin("Admin"),
  deleteSubAdmin
);

//!This is done
subAdminRouter.post("/login", subAdminLogin);

subAdminRouter.post(
  "/logout",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  subAdminLogout
);

subAdminRouter.patch(
  "/update/:subAdminId",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  upload.single("image"),
  updateSubAdmin
);

export default subAdminRouter;
