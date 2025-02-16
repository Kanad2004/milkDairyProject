import express from "express";
import { addFarmer  } from "../controllers/farmerController.js";
const farmerRouter = express.Router();
import {
 
  authenticateSubAdmin,

  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";


//Add farmer by subadmin
farmerRouter.post("/addFarmer", authenticateSubAdmin , authorizeRoleSubAdmin(["subAdmin"]), addFarmer);
// farmerRouter.get("/getFarmers", authenticateSubAdmin , authorizeRoleSubAdmin(["subAdmin"]), getAllfarmers);



//get all farmers
// farmerRouter.get("/getFarmers", authenticateAdmin, authorizeRoleAdmin("Admin"), getAllfarmers);

export default farmerRouter;
