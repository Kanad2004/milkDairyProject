import express from "express";
import {
  addFarmer,
  addMilk,
  deleteFarmer,
  exportFarmerDetail,
  getAllfarmers,
} from "../controllers/farmerController.js";
const farmerRouter = express.Router();
import {
  authenticateAdmin,
  authenticateSubAdmin,
  authorizeRoleAdmiS,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";

farmerRouter.post(
  "/addFarmer",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  addFarmer
);

farmerRouter.get(
  "/get-all-farmers",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  getAllfarmers
);

//Please check this route whether we are adding the new milk or we are updating the milk quantity . . .
farmerRouter.patch(
  "/add-milk",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  addMilk
);

//Add the farmer Id to delete the specific farmer . . . 
farmerRouter.delete(
  "/delete-farmer",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  deleteFarmer
);

// exportFarmerDetail Should Handle Proper Authorization
// Who can export farmer details? Admin, SubAdmin, or both?
// If only Admins can export, update the route:
farmerRouter.get(
  "/export-farmer-detail/:farmerId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["SubAdmin"]),
  exportFarmerDetail
);

export default farmerRouter;