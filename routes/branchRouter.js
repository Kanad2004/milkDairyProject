import express from "express";
import {
  authenticateAdmin,
  authenticateSubAdmin,
  authorizeRoleAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";
import { createBranch, getBranches } from "../controllers/branchController.js";
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

export default branchRouter;
