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

<<<<<<< HEAD
import { generateReport, generateCombinedReport } from "../controllers/transactionController.js";

//subadmin 
transactionRouter.get("/subAdmin/customer-reports/report",  authenticateSubAdmin,authorizeRoleSubAdmin(["subAdmin"]), generateReport);

//admin 
transactionRouter.get("/admin/customer-reports/:type",  authenticateSubAdmin,authorizeRoleSubAdmin(["Admin"]), generateReport);
transactionRouter.get("/admin/customer-reports/all", authenticateSubAdmin,authorizeRoleSubAdmin(["Admin"]),generateCombinedReport);

=======
//subadmin
transactionRouter.get(
  "/subAdmin/customer-reports/:type",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["subAdmin"]),
  generateReport
);
>>>>>>> 3756dec2309dc15fbcde1b05ed35a07af4e5daae

//admin
transactionRouter.get(
  "/admin/customer-reports/:type",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["Admin"]),
  generateReport
);
transactionRouter.get(
  "/admin/customer-reports/all",
  authenticateSubAdmin,
  authorizeRoleSubAdmin(["Admin"]),
  generateCombinedReport
);

export default transactionRouter;
