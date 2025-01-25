import express from "express";
import { addFarmer } from "../controllers/farmerController.js";
const farmerRouter = express.Router();
import {
  authenticateAdmin,
  authenticateSubAdmin,
  authorizeRoleAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";

farmerRouter.post("/addFarmer", authenticateSubAdmin , authorizeRoleSubAdmin(["subAdmin"]), addFarmer);

export default farmerRouter;
