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
  authorizeRoleAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";

farmerRouter.post(
  "/addFarmer",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  addFarmer
);

farmerRouter.get(
  "/get-all-farmers",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getAllfarmers
);

farmerRouter.patch(
  "/add-milk",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  addMilk
);

farmerRouter.delete(
  "/delete-farmer",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  deleteFarmer
);

farmerRouter.get(
  "/export-farmer-detail/:farmerId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  exportFarmerDetail
);

export default farmerRouter;
