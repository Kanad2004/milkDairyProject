import express from "express"
import { authenticateUser, authorizeRoles } from "../middleware/auth.js";
import {createBranch,getBranches,} from "../controllers/branchController.js"
const branchRouter = express.Router();

branchRouter.post("/create-branch", authenticateUser , authorizeRoles("Admin"),createBranch);
branchRouter.get("/get-branches", authenticateUser , authorizeRoles("Admin"),getBranches);