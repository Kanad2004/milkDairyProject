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