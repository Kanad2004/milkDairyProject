import express from "express";
import {
  authenticateAdmin,
  authenticateSubAdmin,
  authorizeRoleAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";
import {
  createBranch,
  deleteBranchById,
  getBranchById,
  getBranches,
  updateBranchById,
  getBranchesForCustomers
} from "../controllers/branchController.js";
const branchRouter = express.Router();

//!This is done
branchRouter.post(
  "/create-branch",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  createBranch
);

//!This is done
branchRouter.get(
  "/get-branches",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  getBranches
);

branchRouter.get(
  "/get-branches-for-customer",
  getBranchesForCustomers
);

branchRouter.patch(
  "/update-branch/:branchId",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  updateBranchById
);

branchRouter.delete(
  "/delete-branch/:branchId",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  deleteBranchById
);

branchRouter.get(
  "/get-branch/:branchId",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  getBranchById
);

export default branchRouter;
