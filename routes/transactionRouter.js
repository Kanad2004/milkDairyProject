import express from "express";
import {
  deleteTransactionById,
  getAllTransactions,
  saveTransaction,
  updateTransactionById,
  generateReport,
  generateCombinedReport,
} from "../controllers/transactionController.js";
import {
  authenticateAdmin,
  authenticateSubAdmin,
  authorizeRoleAdmin,
  authorizeRoleSubAdmin,
} from "../middlewares/auth.js";

const transactionRouter = express.Router();

transactionRouter.post(
  "/save-transaction",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  saveTransaction
);

transactionRouter.get(
  "/get-all-transactions",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  getAllTransactions
);

transactionRouter.patch(
  "/update-transaction/:id",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  updateTransactionById
);

transactionRouter.delete(
  "/delete-transaction/:id",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  deleteTransactionById
);

//subadmin
transactionRouter.get(
  "/subAdmin/customer-reports/:type",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  generateReport
);

//admin
transactionRouter.get(
  "/admin/customer-reports/:type",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  generateReport
);
transactionRouter.get(
  "/admin/customer-reports/all",
  authenticateAdmin,
  authorizeRoleAdmin(["Admin"]),
  generateCombinedReport
);

export default transactionRouter;
