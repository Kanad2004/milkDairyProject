import express from "express";
import {
  addFarmer,
  deleteFarmer,
  exportFarmerDetail,
  getAllfarmers,
  updateFarmer,
  farmerCombinedReport,
  allFarmersCombinedReport
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

farmerRouter.delete(
  "/delete/:id",
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

farmerRouter.patch(
  "/update/:id",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  updateFarmer
);

farmerRouter.get(
  "/combined-report-by-mobileNumber/:mobileNumber" ,
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  farmerCombinedReport
)

farmerRouter.get(
  "/combined-report-for-all-farmers" ,
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  allFarmersCombinedReport
)

export default farmerRouter;
