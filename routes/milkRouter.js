import express from "express";

import {
  authenticateAdmin,
  authenticateSubAdmin,
  authorizeRoleAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";
import {
  addMilk,
  deleteMilkTransaction,
  getAllFarmersTransactionReportsOfBranch,
  getAllMilk,
  getFarmerTransactionByMobileNumber,
  getFarmerTransactionReportByMobileNumber,
  updateMilkTransaction,
} from "../controllers/milkController.js";

const milkRouter = express.Router();

milkRouter.post(
  "/add-milk",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  addMilk
);

milkRouter.get(
  "/get-all-milk",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getAllMilk
);

milkRouter.patch(
  "/update-milk/:farmerId/:transactionId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  updateMilkTransaction
);

milkRouter.delete(
  "/delete-milk/:farmerId/:transactionId",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  deleteMilkTransaction
);

// Get farmer transactions by mobile number (Admin & SubAdmin restricted)
milkRouter.get(
  "/admin/farmer/:mobileNumber",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  getFarmerTransactionByMobileNumber
);

milkRouter.get(
  "/subAdmin/farmer/:mobileNumber",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getFarmerTransactionByMobileNumber
);

// Get all farmers' transactions report for a branch (daily, weekly, monthly)
milkRouter.get(
  "/subAdmin/branch-transactions",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getAllFarmersTransactionReportsOfBranch
);

milkRouter.get(
  "/admin/branch-transactions",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  getAllFarmersTransactionReportsOfBranch
);

// Generate Excel report for a single farmer by mobile number

// Get farmer transactions by mobile number (Admin & SubAdmin restricted)
milkRouter.get(
  "/admin/farmer/excel/:mobileNumber",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  getFarmerTransactionReportByMobileNumber
);

milkRouter.get(
  "/subAdmin/farmer/excel/:mobileNumber",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getFarmerTransactionReportByMobileNumber
);

// Get all farmers' transactions report for a branch (daily, weekly, monthly)

milkRouter.get(
  "/admin/excel/branch-transactions",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  getAllFarmersTransactionReportsOfBranch
);

milkRouter.get(
  "/subAdmin/excel/branch-transactions",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getAllFarmersTransactionReportsOfBranch
);

export default milkRouter;
