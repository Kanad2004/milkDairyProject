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
} from "../controllers/subadminController.js";

const subadminRouter = express.Router();

//!This is done
subadminRouter.post(
  "/addSubAdmin",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
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
subadminRouter.post("/subAdmin/login", subAdminLogin);

subadminRouter.post(
  "/logout",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  subAdminLogout
);

export default subadminRouter;
