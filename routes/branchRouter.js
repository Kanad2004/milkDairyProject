<<<<<<< HEAD
import express from "express"
import {
    authenticateAdmin,
    authorizeRoleAdmin,
  } from "../middlewares/auth.js";
import {createBranch,getBranches,} from "../controllers/branchController.js"
const branchRouter = express.Router();

branchRouter.post("/create-branch", authenticateAdmin , authorizeRoleAdmin(["Admin"]),createBranch);
branchRouter.get("/get-branches", authenticateAdmin , authorizeRoleAdmin(["Admin"]),getBranches);

export default branchRouter;
=======
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
  getBranches,
  updateBranchById,
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

export default branchRouter;
>>>>>>> 14a5353bd279100d6e5c27cb46140631f278c929
